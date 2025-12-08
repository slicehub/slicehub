import axios from "axios";

// Environment variables for Pinata configuration
const JWT = process.env.NEXT_PUBLIC_PINATA_JWT!;
const GATEWAY_URL = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL!;
const GROUP_ID = process.env.NEXT_PUBLIC_PINATA_GROUP_ID!;

/**
 * Uploads a JSON object to IPFS via Pinata, assigning it to a specific group.
 * * @param content - The JSON object containing dispute data (title, description, etc.)
 * @returns The IPFS Hash (CID) of the pinned content, or null if failed.
 */
export const uploadJSONToIPFS = async (content: any) => {
  try {
    if (!JWT) {
      throw new Error("Pinata JWT is missing in environment variables.");
    }

    // Construct the payload required by Pinata for grouping and metadata
    const payload = {
      pinataContent: content, // The actual data goes here
      pinataMetadata: {
        name: content.title
          ? `Dispute - ${content.title}`
          : "Slice Dispute Data",
        keyvalues: {
          type: "dispute_metadata",
          // You can add more custom key-values here for filtering in Pinata
        },
      },
      pinataOptions: {
        cidVersion: 1, // Recommended for better compatibility
        groupId: GROUP_ID, // Assigns this pin to your specific group
      },
    };

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      payload,
      {
        headers: {
          Authorization: `Bearer ${JWT}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to IPFS: ", error);
    return null;
  }
};

/**
 * Fetches JSON data from IPFS using the configured Gateway.
 * * @param ipfsHash - The CID of the content to fetch.
 * @returns The parsed JSON data, or null if failed.
 */
export const fetchJSONFromIPFS = async (ipfsHash: string) => {
  try {
    if (!GATEWAY_URL) {
      throw new Error("IPFS Gateway URL is missing in environment variables.");
    }

    // Ensure the gateway URL ends with a slash
    const baseUrl = GATEWAY_URL.endsWith("/") ? GATEWAY_URL : `${GATEWAY_URL}/`;

    const res = await axios.get(`${baseUrl}${ipfsHash}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching from IPFS (${ipfsHash}): `, error);
    return null;
  }
};
