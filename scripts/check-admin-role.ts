import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

async function checkAdmin() {
  const email = "admin@waimao.com";
  const user = await prisma.appUser.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  console.log("User role:", user.role);

  if (user.role !== UserRole.ADMIN) {
    console.log("Updating role to ADMIN...");
    await prisma.appUser.update({
      where: { email },
      data: { role: UserRole.ADMIN },
    });
    console.log("Role updated.");
  }
}

checkAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
