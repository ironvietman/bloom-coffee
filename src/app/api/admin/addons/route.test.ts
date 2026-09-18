import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, mockAuthorized } = vi.hoisted(() => ({
  mockPrisma: {
    addon: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
  mockAuthorized: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/admin-api", () => ({ isAdminRequestAuthorized: mockAuthorized }));

import { GET, POST } from "./route";
import { DELETE, PATCH } from "./[id]/route";

const context = { params: Promise.resolve({ id: "addon-1" }) };

function formRequest(values: Record<string, string>) {
  const form = new FormData();
  Object.entries(values).forEach(([key, value]) => form.set(key, value));
  return new Request("http://localhost/api/admin/addons", { method: "POST", body: form });
}

describe("add-on admin API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthorized.mockResolvedValue(true);
  });

  it("rejects an unauthenticated list request", async () => {
    mockAuthorized.mockResolvedValue(false);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockPrisma.addon.findMany).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated creation", async () => {
    mockAuthorized.mockResolvedValue(false);

    const response = await POST(formRequest({ name: "Oat milk", priceCents: "50" }));

    expect(response.status).toBe(401);
    expect(mockPrisma.addon.create).not.toHaveBeenCalled();
  });

  it.each([
    { name: "", priceCents: "50" },
    { name: "Oat milk", priceCents: "-1" },
    { name: "Oat milk", priceCents: "0.5" },
  ])("rejects invalid add-on data: $name/$priceCents", async (values) => {
    const response = await POST(formRequest(values));

    expect(response.status).toBe(400);
    expect(mockPrisma.addon.create).not.toHaveBeenCalled();
  });

  it("creates an add-on", async () => {
    const created = { id: "addon-1", name: "Oat milk", priceCents: 50 };
    mockPrisma.addon.create.mockResolvedValue(created);

    const response = await POST(formRequest({ name: " Oat milk ", priceCents: "50" }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(created);
    expect(mockPrisma.addon.create).toHaveBeenCalledWith({
      data: { name: "Oat milk", priceCents: 50 },
    });
  });

  it("updates an add-on", async () => {
    const updated = { id: "addon-1", name: "Almond milk", priceCents: 75 };
    mockPrisma.addon.update.mockResolvedValue(updated);

    const response = await PATCH(formRequest({ name: "Almond milk", priceCents: "75" }), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(updated);
    expect(mockPrisma.addon.update).toHaveBeenCalledWith({
      where: { id: "addon-1" },
      data: { name: "Almond milk", priceCents: 75 },
    });
  });

  it("soft-deletes an add-on", async () => {
    mockPrisma.addon.update.mockResolvedValue({ id: "addon-1", active: false });

    const response = await DELETE(new Request("http://localhost"), context);

    expect(response.status).toBe(200);
    expect(mockPrisma.addon.update).toHaveBeenCalledWith({
      where: { id: "addon-1" },
      data: { active: false },
    });
  });
});
