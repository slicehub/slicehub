import { useMemo } from "react";
import { Contract } from "ethers";
import { useXOContracts } from "@/providers/XOContractsProvider";
import { sliceAbi, sliceAddress } from "@/contracts/slice-abi";

export function useSliceContract() {
  const { signer } = useXOContracts();

  // Memoize the contract so it doesn't re-create on every render
  const contract = useMemo(() => {
    if (!signer || !sliceAddress) return null;
    return new Contract(sliceAddress, sliceAbi, signer);
  }, [signer]);

  return contract;
}
