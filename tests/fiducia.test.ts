
import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("Fiducia Contract Tests", () => {
  it("starts with base reputation", () => {
    const { result } = simnet.callReadOnlyFn(
      "fiducia",
      "get-reputation-score",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(result).toBeUint(10); // Base reputation
  });

  it("allows giving trust and updates reputation", () => {
    // Wallet 1 gives trust to Wallet 2
    // Wallet 1 has rep 10. Level 5. Weight = 50.
    const call = simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet2), Cl.uint(5), Cl.stringUtf8("Great dev")],
      wallet1
    );
    expect(call.result).toBeOk(Cl.bool(true));

    // Check Wallet 2 reputation
    // Base 10 + 50 = 60
    const { result } = simnet.callReadOnlyFn(
      "fiducia",
      "get-reputation-score",
      [Cl.principal(wallet2)],
      wallet1
    );
    expect(result).toBeUint(60);
  });

  it("applies weighted trust correctly", () => {
    // Current State:
    // Wallet 1: Rep 10
    // Wallet 2: Rep 60 (from previous test, if state persists in describe block? Clarinet vitest env usually isolates or persists depending on config. Assuming persistent simnet session per file or reset? 
    // Actually, vitest runs tests? Simnet state usually resets between 'it' blocks if not configured otherwise, or we need to chain them.
    // Let's assume isolation and setup state again or check behavior.
    
    // To be safe, I'll combine the flow in one test or assume reset.
    // Clarinet SDK documentation says: "The state of the chain is reset before each test."
    
    // RE-RUN SETUP: Wallet 1 -> Wallet 2 (Level 5)
    simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet2), Cl.uint(5), Cl.stringUtf8("Great dev")],
      wallet1
    );
    
    // Wallet 2 (Rep 60) gives trust to Wallet 3
    // Level 4. Weight = 60 * 4 = 240.
    const call = simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet3), Cl.uint(4), Cl.stringUtf8("Trusted by minimal expert")],
      wallet2
    );
    expect(call.result).toBeOk(Cl.bool(true));
    
    // Check Wallet 3 Reputation
    // Base 10 + 240 = 250
    const { result } = simnet.callReadOnlyFn(
      "fiducia",
      "get-reputation-score",
      [Cl.principal(wallet3)],
      wallet1
    );
    expect(result).toBeUint(250);
  });

  it("allows revoking trust", () => {
    // Setup: Wallet 1 -> Wallet 2
    simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet2), Cl.uint(5), Cl.stringUtf8("Initial trust")],
      wallet1
    );
    
    // Verify Rep is 60
    let repCheck = simnet.callReadOnlyFn(
      "fiducia",
      "get-reputation-score",
      [Cl.principal(wallet2)],
      wallet1
    );
    expect(repCheck.result).toBeUint(60);
    
    // Revoke Trust
    const revokeCall = simnet.callPublicFn(
      "fiducia",
      "revoke-trust",
      [Cl.principal(wallet2)],
      wallet1
    );
    expect(revokeCall.result).toBeOk(Cl.bool(true));
    
    // Verify Rep returns to Base (10)
    // 60 - 50 = 10
    repCheck = simnet.callReadOnlyFn(
      "fiducia",
      "get-reputation-score",
      [Cl.principal(wallet2)],
      wallet1
    );
    expect(repCheck.result).toBeUint(10);
  });

  it("prevents self-trust", () => {
    const call = simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet1), Cl.uint(5), Cl.stringUtf8("I trust me")],
      wallet1
    );
    expect(call.result).toBeErr(Cl.uint(101)); // ERR-SELF-TRUST
  });
  
  it("prevents double-trusting", () => {
    simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet2), Cl.uint(5), Cl.stringUtf8("One")],
      wallet1
    );
    
    const call = simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet2), Cl.uint(5), Cl.stringUtf8("Two")],
      wallet1
    );
    expect(call.result).toBeErr(Cl.uint(103)); // ERR-ALREADY-TRUSTED
  });
});

