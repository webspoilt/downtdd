import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update user to premium
    const premiumExpires = new Date()
    premiumExpires.setMonth(premiumExpires.getMonth() + 1) // 1 month from now

    const user = await db.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumExpires: premiumExpires,
      }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Premium activated successfully!'
    })
  } catch (error) {
    console.error('Premium upgrade error:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade to premium' },
      { status: 500 }
    )
  }
}
