// import { NextResponse } from "next/server";
// import { Parser } from "json2csv";

// export async function GET() {
//   const socios = await prisma.socio.findMany();
//   const parser = new Parser();
//   const csv = parser.parse(socios);

//   return new NextResponse(csv, {
//     headers: {
//       "Content-Type": "text/csv",
//       "Content-Disposition": "attachment; filename=socios.csv",
//     },
//   });
// }
