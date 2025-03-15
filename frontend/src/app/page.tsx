import Link from 'next/link'
import React from 'react'

const page = () => {
  const userId = 2
  
  return (
    <div>
      <Link href="/signup">
        <button>Sign Up</button>
      </Link>
      <Link href={`/profile/${userId}`}>
        <button>Profile</button>
      </Link>
    </div>
  )
}

export default page