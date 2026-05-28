import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const { userId } = await auth()

  return (
    <div className="min-h-screen p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <UserButton />
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>사용자 ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground font-mono break-all">{userId}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>DB 연결</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Drizzle + Neon 연결됨</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>UI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">shadcn/ui 컴포넌트 동작 중</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
