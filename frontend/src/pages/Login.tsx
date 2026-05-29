<<<<<<< HEAD
import React, { useState } from "react"
=======
import { useState } from "react"
>>>>>>> 66dd92f (api: login now communicate with the backend api)
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
<<<<<<< HEAD
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
=======
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:8000/apiauth/login", {
>>>>>>> 66dd92f (api: login now communicate with the backend api)
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

<<<<<<< HEAD
      if (!res.ok) {
        const errText = await res.text()
        setError(errText || "Login failed")
        setLoading(false)
        return
      }

      const data = await res.json()
      // expected shape: { access_token: string, token_type: 'bearer' }
      if (data?.access_token) {
        localStorage.setItem("access_token", data.access_token)
        localStorage.setItem("token_type", data.token_type || "bearer")
        navigate("/")
      } else {
        setError("Invalid login response")
      }
    } catch (err: any) {
      setError(err?.message || "Network error")
=======
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Invalid credentials")
      }

      // Store the token
      localStorage.setItem("token", data.access_token)

      // Redirect to home or dashboard
      navigate("/")
    } catch (err: any) {
      setError(err.message)
>>>>>>> 66dd92f (api: login now communicate with the backend api)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-sm p-8 space-y-6 bg-card rounded-xl border shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access the dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="admin@example.com"
              type="email"
=======
              type="email"
              placeholder="admin@example.com"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
>>>>>>> 66dd92f (api: login now communicate with the backend api)
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              type="password"
            />
          </div>
          <div>
            <Button className="w-full" onClick={handleSignIn} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
=======
              type="password"
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

>>>>>>> 66dd92f (api: login now communicate with the backend api)
        <div className="text-center">
          <Link to="/" className="text-sm text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
