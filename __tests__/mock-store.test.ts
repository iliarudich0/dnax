import { describe, expect, it, beforeEach } from "vitest";
import {
  mockRegisterUser,
  mockLoginUser,
  mockUploadFile,
  mockListUploads,
  mockDeleteUpload,
  storeReferral,
  getReferral,
} from "@/lib/mock-store";

function makeFile(name: string, content: string, type = "text/plain") {
  return new File([content], name, { type });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("mock store", () => {
  it("registers and logs in user", () => {
    mockRegisterUser({ email: "test@x.dev", password: "secret12", displayName: "Test" });
    const user = mockLoginUser("test@x.dev", "secret12");
    expect(user.displayName).toBe("Test");
  });

  it("uploads and lists files", async () => {
    const user = mockRegisterUser({ email: "a@b.com", password: "123456", displayName: "A" });
    await mockUploadFile(makeFile("demo.txt", "hello"), user.id);
    const uploads = mockListUploads(user.id);
    expect(uploads.length).toBe(1);
    const deleted = mockDeleteUpload(uploads[0]!.id);
    expect(deleted).toBe(true);
  });

  it("stores referral code", () => {
    storeReferral("code123");
    expect(getReferral()).toBe("code123");
  });
});
