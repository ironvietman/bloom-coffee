import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, mockAuthorized } = vi.hoisted(() => ({
  mockPrisma: {
    drink: {
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

const context = { params: Promise.resolve({ id: "drink-1" }) };

function formRequest(values: Record<string, string>) {
  const form = new FormData();
  Object.entries(values).forEach(([key, value]) => form.set(key, value));
  return new Request("http://localhost/api/admin/drinks", { method: "POST", body: form });
}

describe("drink admin API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthorized.mockResolvedValue(true);
  });

  it("rejects an unauthenticated list request", async () => {
    mockAuthorized.mockResolvedValue(false);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockPrisma.drink.findMany).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated creation", async () => {
    mockAuthorized.mockResolvedValue(false);

    const response = await POST(formRequest({ name: "Latte", description: "Espresso and milk", basePriceCents: "400" }));

    expect(response.status).toBe(401);
    expect(mockPrisma.drink.create).not.toHaveBeenCalled();
  });

  it.each([
    { name: "", description: "Espresso and milk", basePriceCents: "400" },
    { name: "Latte", description: "", basePriceCents: "400" },
    { name: "Latte", description: "Espresso and milk", basePriceCents: "-1" },
    { name: "Latte", description: "Espresso and milk", basePriceCents: "4.5" },
  ])("rejects invalid drink data: $name/$basePriceCents", async (values) => {
    const response = await POST(formRequest(values));

    expect(response.status).toBe(400);
    expect(mockPrisma.drink.create).not.toHaveBeenCalled();
  });

  it("creates a drink", async () => {
    const created = { id: "drink-1", name: "Latte", description: "Espresso and milk", basePriceCents: 400 };
    mockPrisma.drink.create.mockResolvedValue(created);

    const response = await POST(formRequest({ name: " Latte ", description: " Espresso and milk ", basePriceCents: "400" }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(created);
    expect(mockPrisma.drink.create).toHaveBeenCalledWith({
      data: { name: "Latte", description: "Espresso and milk", basePriceCents: 400 },
    });
  });

  it("updates a drink", async () => {
    const updated = { id: "drink-1", name: "Mocha", description: "Espresso and chocolate", basePriceCents: 500 };
    mockPrisma.drink.update.mockResolvedValue(updated);

    const response = await PATCH(formRequest({ name: "Mocha", description: "Espresso and chocolate", basePriceCents: "500" }), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(updated);
    expect(mockPrisma.drink.update).toHaveBeenCalledWith({
      where: { id: "drink-1" },
      data: { name: "Mocha", description: "Espresso and chocolate", basePriceCents: 500 },
    });
  });

  it("soft-deletes a drink", async () => {
    mockPrisma.drink.update.mockResolvedValue({ id: "drink-1", active: false });

    const response = await DELETE(new Request("http://localhost"), context);

    expect(response.status).toBe(200);
    expect(mockPrisma.drink.update).toHaveBeenCalledWith({
      where: { id: "drink-1" },
      data: { active: false },
    });
  });
});
