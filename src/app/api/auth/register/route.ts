import connectDb from "@/lib/db"
import User from "@/models/user.model"
import bcrypt from "bcryptjs"

import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    await connectDb()

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      )
    }

    if(password.length<3){
         return NextResponse.json({message:"password must be 3 characters"},{
                status :400
            })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    return NextResponse.json(user, {
      status: 201,
    })

  } catch (error) {
    return NextResponse.json(
      { message: `Register error: ${error}` },
      { status: 500 }
    )
  }
}