import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, hashPassword } from "@/lib/auth";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const searchParams = request.nextUrl.searchParams;
    const roleParam = searchParams.get("role");

    // Build the query
    const whereClause: any = {};
    if (roleParam && roleParam !== "ทั้งหมด") {
      whereClause.role = roleParam as Role;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        student: true,
        teacher: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map((user: any) => {
      // Determine username: student code, teacher code, or default to ID
      let username = `user_${user.id}`;
      if (user.role === "student" && user.student) {
        username = user.student.studentCode;
      } else if (user.role === "teacher" && user.teacher) {
        username = user.teacher.teacherCode;
      }

      return {
        id: user.id.toString(),
        username,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        status: user.isActive ? "active" : "inactive",
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : "N/A"
      };
    });

    return NextResponse.json({ success: true, data: formattedUsers }, { status: 200 });

  } catch (error: any) {
    console.error("Admin Users GET API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { email, firstName, lastName, role, passwordHash } = body;

    let finalPasswordHash = "hashed_default_password";
    if (passwordHash) {
      finalPasswordHash = await hashPassword(passwordHash);
    }

    // This is a minimal implementation. In reality, creating a student requires a departmentId, admissionYear, etc.
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role: role as Role,
        passwordHash: finalPasswordHash, // Store the securely hashed password
      }
    });

    if (role === "student" || role === "teacher") {
      let department = await prisma.department.findFirst();
      if (!department) {
        // Fallback if DB is completely empty
        const faculty = await prisma.faculty.create({ data: { name: "รอกำหนด", code: "TBD" } });
        department = await prisma.department.create({ data: { name: "รอกำหนด", code: "TBD", facultyId: faculty.id } });
      }

      if (role === "student") {
        await prisma.student.create({
          data: {
            userId: newUser.id,
            studentCode: email.split('@')[0] || `S${newUser.id}`,
            departmentId: department.id,
            admissionYear: new Date().getFullYear() + 543
          }
        });
      } else if (role === "teacher") {
        await prisma.teacher.create({
          data: {
            userId: newUser.id,
            teacherCode: email.split('@')[0] || `T${newUser.id}`,
            departmentId: department.id
          }
        });
      }
    }

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });

  } catch (error: any) {
    console.error("Admin Users POST API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { id, email, firstName, lastName, role, isActive } = body;

    if (!id) return NextResponse.json({ message: "User ID is required" }, { status: 400 });

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        email,
        firstName,
        lastName,
        role: role as Role,
        isActive
      }
    });

    return NextResponse.json({ success: true, data: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("Admin Users PATCH API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ message: "User ID is required" }, { status: 400 });

    await prisma.user.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Admin Users DELETE API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
