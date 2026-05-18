import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to LETI</h1>
      <h2>barebone page</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        LETI is a platform for community crime reporting and analysis. Join us in making our neighborhood safer. Sooner will be a proper page when linkage to the backend api is established.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/submit">Report a Crime</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/login">Admin Login</Link>
        </Button>
      </div>
    </div>
  )
}
