
import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

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
    expect(result).toBeOk(Cl.uint(10)); // Base reputation
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
    expect(result).toBeOk(Cl.uint(60));
  });

  it("emits event when giving trust", () => {
    const call = simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet2), Cl.uint(5), Cl.stringUtf8("Great dev")],
      wallet1
    );
    expect(call.result).toBeOk(Cl.bool(true));
    
    // Check for print event
    const printEvents = call.events.filter(
      (e) => e.event === "print_event"
    );
    expect(printEvents).toHaveLength(1);
    expect(printEvents[0].data.value).toStrictEqual(
      Cl.tuple({
        event: Cl.stringAscii("give-trust"),
        trustor: Cl.principal(wallet1),
        recipient: Cl.principal(wallet2),
        level: Cl.uint(5),
        weight: Cl.uint(50) // 10 * 5
      })
    );
  });

  it("applies weighted trust correctly", () => {
    // 1. Wallet 1 gives trust to Wallet 2
    simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet2), Cl.uint(5), Cl.stringUtf8("Great dev")],
      wallet1
    );
    
    // Wallet 2 Rep is now 60
    
    // 2. Wallet 2 gives trust to Wallet 3
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
    expect(result).toBeOk(Cl.uint(250));
  });

  it("allows updating trust", () => {
    // Initial Trust
    simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet2), Cl.uint(2), Cl.stringUtf8("Initial")],
      wallet1
    );
    
    // Verify Rep: Base 10 + (10*2) = 30
    let repCheck = simnet.callReadOnlyFn(
      "fiducia",
      "get-reputation-score",
      [Cl.principal(wallet2)],
      wallet1
    );
    expect(repCheck.result).toBeOk(Cl.uint(30));

    // Update Trust to Level 5
    const updateCall = simnet.callPublicFn(
      "fiducia",
      "update-trust",
      [Cl.principal(wallet2), Cl.uint(5), Cl.stringUtf8("Updated")],
      wallet1
    );
    expect(updateCall.result).toBeOk(Cl.bool(true));
    
    // Verify Rep: Base 10 + (10*5) = 60
    // Note: It removes old weight (20) and adds new weight (50).
    // 30 - 20 + 50 = 60. Correct.
    repCheck = simnet.callReadOnlyFn(
      "fiducia",
      "get-reputation-score",
      [Cl.principal(wallet2)],
      wallet1
    );
    expect(repCheck.result).toBeOk(Cl.uint(60));
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
    expect(repCheck.result).toBeOk(Cl.uint(60));
    
    // Revoke Trust
    const revokeCall = simnet.callPublicFn(
      "fiducia",
      "revoke-trust",
      [Cl.principal(wallet2)],
      wallet1
    );
    expect(revokeCall.result).toBeOk(Cl.bool(true));
    
    // Verify Rep returns to Base (10)
    repCheck = simnet.callReadOnlyFn(
      "fiducia",
      "get-reputation-score",
      [Cl.principal(wallet2)],
      wallet1
    );
    expect(repCheck.result).toBeOk(Cl.uint(10));
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

  it("prevents updating non-existent trust", () => {
    const call = simnet.callPublicFn(
      "fiducia",
      "update-trust",
      [Cl.principal(wallet2), Cl.uint(5), Cl.stringUtf8("Update")],
      wallet1
    );
    expect(call.result).toBeErr(Cl.uint(104)); // ERR-NOT-FOUND
  });

  it("correctly lists trust given", () => {
    simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet2), Cl.uint(5), Cl.stringUtf8("Trust 2")],
      wallet1
    );
    simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet3), Cl.uint(5), Cl.stringUtf8("Trust 3")],
      wallet1
    );

    const { result } = simnet.callReadOnlyFn(
      "fiducia",
      "get-trust-given",
      [Cl.principal(wallet1)],
      wallet1
    );
    
    expect(result).toBeOk(Cl.list([
      Cl.principal(wallet2),
      Cl.principal(wallet3)
    ]));
  });
  
  it("correctly lists trust received", () => {
    simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet2), Cl.uint(5), Cl.stringUtf8("From 1")],
      wallet1
    );
    simnet.callPublicFn(
      "fiducia",
      "give-trust",
      [Cl.principal(wallet2), Cl.uint(5), Cl.stringUtf8("From 3")],
      wallet3
    );

    const { result } = simnet.callReadOnlyFn(
      "fiducia",
      "get-trust-received",
      [Cl.principal(wallet2)],
      wallet1
    );
    
    expect(result).toBeOk(Cl.list([
      Cl.principal(wallet1),
      Cl.principal(wallet3)
    ]));
  });
});

