import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Bienvenue {session.user.name || 'Utilisateur'} !</h1>
      <p className="text-muted-foreground">Email : {session.user.email}</p>
      {session.user.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.user.image}
          alt="Avatar"
          width={50}
          height={50}
          className="rounded-full border"
        />
      )}
    </div>
  )
}
