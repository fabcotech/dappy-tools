import { expect } from "chai";

import {
  signZoneTransaction,
  checkZoneTransaction,
  publicKeyFromPrivateKey,
} from "./index";

const privateKey =
  "28a5c9ac133b4449ca38e9bdf7cacdce31079ef6b3ac2f0a080af83ecff98b36";

describe("index.ts", () => {
  let signature = "";
  let publicKey = "";
  let zone = {};
  it("should generate correct public key (publicKeyFromPrivateKey)", async () => {
    expect(publicKeyFromPrivateKey(privateKey)).to.equal(
      "04ea33c48dff95cdff4f4211780a5b151570a9a2fac5e62e5fa545c1aa5be3539c34d426b046f985204815964e10fcd1d87ef88d9bcf43816ad1fa00934cfe4652"
    );
    publicKey =
      "04ea33c48dff95cdff4f4211780a5b151570a9a2fac5e62e5fa545c1aa5be3539c34d426b046f985204815964e10fcd1d87ef88d9bcf43816ad1fa00934cfe4652";
  });

  it("should sign correctly (signZoneTransaction)", async () => {
    zone = {
      origin: "apple",
      records: {
        host: "@",
        type: "TXT",
        value: `OWNER=${publicKey}`,
      },
    };
    const s = signZoneTransaction(
      {
        zone,
        date: 1661785885595,
      },
      privateKey,
      "hex"
    );

    expect(s).to.equal(
      "30450221009bbc5df2b52568c59b2aa105d56bf0fab4703853d62b466d764c020996049f1a022056918ccc8c362e3c70e70f0d440f063df3e2c1705d912d169531a0965628c7d3"
    );
    signature = s as string;
  });

  it("should fail check signature (invalid signature) (checkZoneTransaction)", () => {
    const zoneTransactionWithSignature = {
      data: {
        zone: undefined,
        date: 1661785885595 + 1,
      },
      signature,
    };

    expect(() => {
      checkZoneTransaction(publicKey, zoneTransactionWithSignature, true);
    }).to.throw("Cannot validate payload");
  });

  it("should fail check signature (invalid date) (checkZoneTransaction)", () => {
    const zoneTransactionWithSignature = {
      data: {
        zone,
        date: 1661785885595,
      },
      signature,
    };

    expect(() => {
      checkZoneTransaction(publicKey, zoneTransactionWithSignature);
    }).to.throw("Invalid date");
  });

  it("should check signature", () => {
    const zoneTransactionWithSignature = {
      data: {
        zone,
        date: 1661785885595,
      },
      signature,
    };

    expect(
      checkZoneTransaction(publicKey, zoneTransactionWithSignature, true)
    ).to.equal(true);
  });

  it("should check signature with valid date", () => {
    const data = {
      zone,
      date: new Date().toISOString(),
    };
    const s = signZoneTransaction(data, privateKey, "hex");
    const zoneTransactionWithSignature = {
      data,
      signature: s as string,
    };
    expect(
      checkZoneTransaction(publicKey, zoneTransactionWithSignature)
    ).to.equal(true);
  });

  it("should fail to check signature (too old payload)", () => {
    const data = {
      zone,
      // now minus 11 minutes, too old
      date: new Date(new Date().getTime() - 1000 * 60 * 11).toISOString(),
    };
    const s = signZoneTransaction(data, privateKey, "hex");
    const zoneTransactionWithSignature = {
      data,
      signature: s as string,
    };
    expect(() => {
      checkZoneTransaction(publicKey, zoneTransactionWithSignature);
    }).to.throw("Invalid date");
  });

  it("should fail to check signature (future date)", () => {
    const data = {
      zone,
      // now plus 2 minutes
      date: new Date(new Date().getTime() + 1000 * 60 * 2).toISOString(),
    };
    const s = signZoneTransaction(data, privateKey, "hex");
    const zoneTransactionWithSignature = {
      data,
      signature: s as string,
    };
    expect(() => {
      checkZoneTransaction(publicKey, zoneTransactionWithSignature);
    }).to.throw("Invalid date");
  });
});
