import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm p-8 space-y-6 bg-card rounded-xl border shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access the dashboard</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
            <input 
              id="email" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="admin@example.com"
              type="email" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
            <input 
              id="password" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              type="password" 
            />
          </div>
          <Button className="w-full">Sign In</Button>
        </div>
        <div className="text-center">
          <Link to="/" className="text-sm text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
