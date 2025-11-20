    export type WalletDto = {
      id: string;
      name: string;
      balance: string; // Prisma.Decimal -> string in JSON
    };

    export async function getWallet(): Promise<WalletDto> {
      const res = await fetch("/api/wallet", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load wallet");
      return res.json();
    }
