import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function createGymConfig() {
  const existing = await prisma.gymConfig.findFirst({
    where: { email: "contacto@gympro.com" },
  });
  if (existing) return existing;

  return prisma.gymConfig.create({
    data: {
      name: "GYM PRO",
      logo: "/logo.png",
      email: "contacto@gympro.com",
      currency: "BOB",
      openingTime: "06:00",
      closingTime: "22:00",
    },
  });
}

async function createMemberships() {
  await prisma.membership.createMany({
    data: [
      {
        name: "Mensual Básico",
        price: 200,
        duration: 30,
        features: ["Acceso general", "Pesas", "Cardio"],
        description: "Ideal para principiantes o entrenamiento regular.",
      },
      {
        name: "Trimestral Premium",
        price: 500,
        duration: 90,
        features: ["Acceso completo", "Clases grupales", "Entrenador personalizado"],
        description: "Plan extendido para miembros dedicados.",
      },
    ],
    skipDuplicates: true,
  });

  return prisma.membership.findFirst({
    where: { name: "Mensual Básico" },
  });
}

async function createMembers(basicMembershipId: string) {
  await prisma.member.createMany({
    data: [
      {
        name: "Juan Pérez",
        email: "juan.perez@example.com",
        phone: "+59170000001",
        membershipId: basicMembershipId,
        status: "active",
        joinDate: subDays(new Date(), 10),
        expiryDate: addDays(new Date(), 20),
        birthDate: new Date(1995, 5, 14),
        qrCode: "QR12345",
        photo: "/uploads/juan.jpg",
      },
      {
        name: "María López",
        email: "maria.lopez@example.com",
        phone: "+59170000002",
        membershipId: basicMembershipId,
        status: "expired",
        joinDate: subDays(new Date(), 60),
        expiryDate: subDays(new Date(), 10),
        birthDate: new Date(1992, 3, 22),
        qrCode: "QR67890",
        photo: "/uploads/maria.jpg",
      },
    ],
    skipDuplicates: true,
  });

  return prisma.member.findFirst({
    where: { email: "juan.perez@example.com" },
  });
}

async function createUsers(juanId: string) {
  const [adminPass, receptionPass, clientPass] = await Promise.all([
    bcrypt.hash("123123", 10),
    bcrypt.hash("recepcion123", 10),
    bcrypt.hash("cliente123", 10),
  ]);

  const users = await prisma.user.createMany({
    data: [
      {
        name: "Administrador",
        email: "admin@gympro.com",
        password: adminPass,
        role: "admin",
      },
      {
        name: "Recepcionista",
        email: "recepcion@gympro.com",
        password: receptionPass,
        role: "reception",
      },
      {
        name: "Juan Pérez",
        email: "juan.perez@example.com",
        password: clientPass,
        role: "client",
        memberId: juanId,
      },
    ],
    skipDuplicates: true,
  });

  return prisma.user.findFirst({
    where: { email: "juan.perez@example.com" },
  });
}

async function createPayments(juanId: string) {
  await prisma.payment.createMany({
    data: [
      {
        memberId: juanId,
        amount: 200,
        date: subDays(new Date(), 5),
        status: "paid",
        invoiceNumber: "INV-001",
        membershipName: "Mensual Básico",
      },
      {
        memberId: juanId,
        amount: 200,
        date: addDays(new Date(), 25),
        status: "pending",
        invoiceNumber: "INV-002",
        membershipName: "Mensual Básico",
      },
    ],
    skipDuplicates: true,
  });
}

async function createAttendances(juanId: string) {
  await prisma.attendance.createMany({
    data: [
      {
        memberId: juanId,
        date: subDays(new Date(), 1),
        time: "08:15",
        status: "allowed",
        attended: true,
      },
      {
        memberId: juanId,
        date: subDays(new Date(), 2),
        time: "07:50",
        status: "allowed",
        attended: true,
      },
    ],
    skipDuplicates: true,
  });
}

async function createMessages() {
  await prisma.message.createMany({
    data: [
      {
        type: "renewal",
        recipient: "juan.perez@example.com",
        content: "Tu membresía está próxima a vencer. ¡Renuévala a tiempo!",
        status: "sent",
        date: new Date(),
      },
      {
        type: "birthday",
        recipient: "maria.lopez@example.com",
        content: "🎉 ¡Feliz cumpleaños María! Te esperamos para celebrar entrenando 💪",
        status: "sent",
        date: new Date(),
      },
    ],
    skipDuplicates: true,
  });
}

async function createActivities() {
  await prisma.activity.createMany({
    data: [
      {
        type: "payment",
        description: "Juan Pérez realizó un pago de 200 BOB.",
        date: new Date(),
        icon: "💰",
      },
      {
        type: "attendance",
        description: "Juan Pérez asistió al gimnasio.",
        date: subDays(new Date(), 1),
        icon: "🏋️‍♂️",
      },
    ],
    skipDuplicates: true,
  });
}

async function createExpenses() {
  await prisma.expense.createMany({
    data: [
      {
        category: "mantenimiento",
        description: "Reparación de máquinas elípticas",
        amount: 450,
        date: subDays(new Date(), 2),
        status: "paid",
      },
      {
        category: "luz",
        description: "Pago mensual de energía eléctrica",
        amount: 700,
        date: subDays(new Date(), 5),
        status: "pending",
      },
    ],
    skipDuplicates: true,
  });
}

async function createNotifications(clientId: string) {
  await prisma.notification.createMany({
    data: [
      {
        type: "payment",
        title: "Pago realizado",
        message: "Tu pago de 200 BOB fue registrado correctamente.",
        date: new Date(),
        userId: clientId,
      },
      {
        type: "expiry",
        title: "Membresía próxima a vencer",
        message: "Tu membresía vence en 3 días. ¡Renuévala!",
        date: subDays(new Date(), 1),
        userId: clientId,
      },
    ],
    skipDuplicates: true,
  });
}

async function main() {
  console.log("🌱 Iniciando seed...");

  const gym = await createGymConfig();
  const basicMembership = await createMemberships();

  if (!basicMembership) throw new Error("❌ No se pudo crear membresía básica.");

  const juan = await createMembers(basicMembership.id);

  if (!juan) throw new Error("❌ No se pudo crear el miembro Juan Pérez.");

  const clientUser = await createUsers(juan.id);

  if (!clientUser) throw new Error("❌ No se pudo crear usuario cliente.");

  await Promise.all([
    createPayments(juan.id),
    createAttendances(juan.id),
    createMessages(),
    createActivities(),
    createExpenses(),
    createNotifications(clientUser.id),
  ]);

  console.log("✅ Seed completado con éxito");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
