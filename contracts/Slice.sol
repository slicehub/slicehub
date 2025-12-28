// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// TODO:
// - When enough jurors, don't let more jurors join
// - Add chainlink VRF
// - Add custom token / USDC
// - Add more getters to the SMC, like the disputes a juror is currently assigned to
// - Only claimer and defender can pay the dispute
// - Only can pay for a dispute if not already paid
// - Only can pay for a dispute when time limit not passed
// - Don't let claimer and defender be the same address
interface IERC20 {
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

contract Slice {
    // --- Enums & Structs ---
    enum DisputeStatus {
        Created,
        Commit,
        Reveal,
        Finished
    }

    struct DisputeConfig {
        address defender;
        string category;
        string ipfsHash;
        uint256 jurorsRequired;
        uint256 paySeconds;
        uint256 commitSeconds;
        uint256 revealSeconds;
    }

    struct Dispute {
        uint256 id;
        address claimer;
        address defender;
        string category;
        uint256 requiredStake;
        uint256 jurorStake;
        uint256 jurorsRequired;
        string ipfsHash;
        DisputeStatus status;
        bool claimerPaid;
        bool defenderPaid;
        address winner;
        uint256 payDeadline;
        uint256 commitDeadline;
        uint256 revealDeadline;
    }

    // --- State Variables ---
    uint256 public disputeCount;
    mapping(uint256 => Dispute) internal disputeStore;
    IERC20 public immutable stakingToken;

    // --- Mappings ---
    // 1. Core Logic Mappings
    mapping(uint256 => address[]) public disputeJurors;
    mapping(uint256 => mapping(address => bytes32)) public commitments;
    mapping(uint256 => mapping(address => uint256)) public revealedVotes;
    mapping(uint256 => mapping(address => bool)) public hasRevealed;

    // 2. UX / Tracking Mappings (NEW)
    mapping(address => uint256[]) private jurorDisputes; // IDs where I am a juror
    mapping(address => uint256[]) private userDisputes; // IDs where I am claimer/defender

    // --- Events ---
    event DisputeCreated(uint256 indexed id, address claimer, address defender);
    event FundsDeposited(uint256 indexed id, address role, uint256 amount);
    event JurorJoined(uint256 indexed id, address juror);
    event StatusChanged(uint256 indexed id, DisputeStatus newStatus);
    event VoteCommitted(uint256 indexed id, address juror);
    event VoteRevealed(uint256 indexed id, address juror, uint256 vote);
    event RulingExecuted(uint256 indexed id, address winner);

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    // --- Logic ---
    function createDispute(
        DisputeConfig calldata _config
    ) external returns (uint256) {
        disputeCount++;
        uint256 id = disputeCount;

        Dispute storage d = disputeStore[id];
        d.id = id;
        d.claimer = msg.sender;
        d.defender = _config.defender;
        d.category = _config.category;

        // 0.1 USDC = 100,000 units
        d.requiredStake = 100000;
        // 0.05 USDC = 50,000 units
        d.jurorStake = 50000;

        d.jurorsRequired = _config.jurorsRequired;
        d.ipfsHash = _config.ipfsHash;
        d.status = DisputeStatus.Created;

        d.payDeadline = block.timestamp + _config.paySeconds;
        d.commitDeadline = d.payDeadline + _config.commitSeconds;
        d.revealDeadline = d.commitDeadline + _config.revealSeconds;

        // TRACKING UPDATE: Add to user lists
        userDisputes[msg.sender].push(id);
        userDisputes[_config.defender].push(id);

        emit DisputeCreated(id, msg.sender, _config.defender);
        return id;
    }

    // --- View Functions ---

    function disputes(uint256 _id) external view returns (Dispute memory) {
        return disputeStore[_id];
    }

    // Get all disputes for a Juror (For "My Votes" page)
    function getJurorDisputes(
        address _user
    ) external view returns (uint256[] memory) {
        return jurorDisputes[_user];
    }

    // Get all disputes for a Claimer/Defender (For "Profile" page)
    function getUserDisputes(
        address _user
    ) external view returns (uint256[] memory) {
        return userDisputes[_user];
    }

    // --- Actions ---
    function payDispute(uint256 _id) external {
        Dispute storage d = disputeStore[_id];
        require(d.status == DisputeStatus.Created, "Payment closed");
        require(block.timestamp <= d.payDeadline, "Deadline passed");

        if (msg.sender == d.claimer) {
            require(!d.claimerPaid, "Already paid");
            d.claimerPaid = true;
        } else if (msg.sender == d.defender) {
            require(!d.defenderPaid, "Already paid");
            d.defenderPaid = true;
        } else {
            revert("Only disputants can pay");
        }

        bool success = stakingToken.transferFrom(
            msg.sender,
            address(this),
            d.requiredStake
        );
        require(success, "Transfer failed");

        emit FundsDeposited(_id, msg.sender, d.requiredStake);

        if (d.claimerPaid && d.defenderPaid) {
            d.status = DisputeStatus.Commit;
            emit StatusChanged(_id, DisputeStatus.Commit);
        }
    }

    function joinDispute(uint256 _id) external {
        Dispute storage d = disputeStore[_id];
        require(d.status == DisputeStatus.Commit, "Not in Commit phase");
        require(disputeJurors[_id].length < d.jurorsRequired, "Jury full");

        address[] memory currentJurors = disputeJurors[_id];
        for (uint i = 0; i < currentJurors.length; i++) {
            require(currentJurors[i] != msg.sender, "Already joined");
        }

        bool success = stakingToken.transferFrom(
            msg.sender,
            address(this),
            d.jurorStake
        );
        require(success, "Transfer failed");

        disputeJurors[_id].push(msg.sender);

        // TRACKING UPDATE: Add to juror's list
        jurorDisputes[msg.sender].push(_id);

        emit JurorJoined(_id, msg.sender);
    }

    function commitVote(uint256 _id, bytes32 _commitment) external {
        Dispute storage d = disputeStore[_id];
        require(d.status == DisputeStatus.Commit, "Not voting phase");
        require(block.timestamp <= d.commitDeadline, "Voting ended");
        require(_isJuror(_id, msg.sender), "Not a juror");

        commitments[_id][msg.sender] = _commitment;
        emit VoteCommitted(_id, msg.sender);

        if (disputeJurors[_id].length == d.jurorsRequired) {
            bool allVoted = true;
            for (uint i = 0; i < disputeJurors[_id].length; i++) {
                if (commitments[_id][disputeJurors[_id][i]] == bytes32(0)) {
                    allVoted = false;
                    break;
                }
            }
            if (allVoted) {
                d.status = DisputeStatus.Reveal;
                emit StatusChanged(_id, DisputeStatus.Reveal);
            }
        }
    }

    function revealVote(uint256 _id, uint256 _vote, uint256 _salt) external {
        Dispute storage d = disputeStore[_id];
        if (
            d.status == DisputeStatus.Commit &&
            block.timestamp > d.commitDeadline
        ) {
            d.status = DisputeStatus.Reveal;
        }

        require(d.status == DisputeStatus.Reveal, "Not reveal phase");
        require(_isJuror(_id, msg.sender), "Not a juror");
        require(!hasRevealed[_id][msg.sender], "Already revealed");

        bytes32 verify = keccak256(abi.encodePacked(_vote, _salt));
        require(verify == commitments[_id][msg.sender], "Hash mismatch");

        revealedVotes[_id][msg.sender] = _vote;
        hasRevealed[_id][msg.sender] = true;

        emit VoteRevealed(_id, msg.sender, _vote);
    }

    function executeRuling(uint256 _id) external {
        Dispute storage d = disputeStore[_id];
        require(d.status == DisputeStatus.Reveal, "Wrong phase");

        uint256 votesFor0 = 0;
        uint256 votesFor1 = 0;
        address[] memory jurors = disputeJurors[_id];

        for (uint i = 0; i < jurors.length; i++) {
            address j = jurors[i];
            if (hasRevealed[_id][j]) {
                if (revealedVotes[_id][j] == 0) votesFor0++;
                else if (revealedVotes[_id][j] == 1) votesFor1++;
            }
        }

        uint256 winningChoice = votesFor1 > votesFor0 ? 1 : 0;
        address winnerAddr = winningChoice == 1 ? d.claimer : d.defender;
        d.winner = winnerAddr;
        d.status = DisputeStatus.Finished;

        require(
            stakingToken.transfer(winnerAddr, d.requiredStake * 2),
            "Transfer failed"
        );

        uint256 totalLosingStake = 0;
        uint256 winningJurorCount = 0;

        for (uint i = 0; i < jurors.length; i++) {
            address j = jurors[i];
            if (hasRevealed[_id][j] && revealedVotes[_id][j] == winningChoice) {
                winningJurorCount++;
            } else {
                totalLosingStake += d.jurorStake;
            }
        }

        for (uint i = 0; i < jurors.length; i++) {
            address j = jurors[i];
            if (hasRevealed[_id][j] && revealedVotes[_id][j] == winningChoice) {
                uint256 reward = d.jurorStake +
                    (totalLosingStake / winningJurorCount);
                require(stakingToken.transfer(j, reward), "Transfer failed");
            }
        }

        emit RulingExecuted(_id, winnerAddr);
    }

    function _isJuror(uint256 _id, address _user) internal view returns (bool) {
        address[] memory jurors = disputeJurors[_id];
        for (uint i = 0; i < jurors.length; i++) {
            if (jurors[i] == _user) return true;
        }
        return false;
    }

    function disputeCountView() external view returns (uint256) {
        return disputeCount;
    }
}
