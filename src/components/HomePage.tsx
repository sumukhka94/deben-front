import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

// Mock data for groups
const groups = [
  {
    id: 1,
    name: "Weekend Trip",
    description: "Expenses for our weekend getaway to the ",
    members: [
      { id: 1, name: "John Doe", avatar: "/placeholder.svg?height=32&width=32" },
      { id: 2, name: "Jane Smith", avatar: "/placeholder.svg?height=32&width=32" },
      { id: 3, name: "Mike Johnson", avatar: "/placeholder.svg?height=32&width=32" },
      { id: 4, name: "Sarah Wilson", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    totalExpenses: 1250.5,
    expenseCount: 8,
  },
  {
    id: 2,
    name: "Office Lunch",
    description: "Daily lunch expenses for the team",
    members: [
      { id: 1, name: "John Doe", avatar: "/placeholder.svg?height=32&width=32" },
      { id: 5, name: "Alex Brown", avatar: "/placeholder.svg?height=32&width=32" },
      { id: 6, name: "Emma Davis", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    totalExpenses: 450.75,
    expenseCount: 12,
  },
  {
    id: 3,
    name: "House Rent",
    description: "Monthly rent and utilities for shared apartment",
    members: [
      { id: 2, name: "Jane Smith", avatar: "/placeholder.svg?height=32&width=32" },
      { id: 3, name: "Mike Johnson", avatar: "/placeholder.svg?height=32&width=32" },
      { id: 7, name: "Lisa Garcia", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    totalExpenses: 2400.0,
    expenseCount: 3,
  },

]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900">deben</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Groups</h1>
          <p className="mt-2 text-gray-600">Manage and track expenses across different groups</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link key={group.id} to={`/group/${group.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {group.name}
                    <Badge variant="secondary">{group.expenseCount} expenses</Badge>
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Total Expenses</span>
                      <span className="text-lg font-semibold text-green-600">${group.totalExpenses.toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500 block mb-2">Members</span>
                      <div className="flex -space-x-2">
                        {group.members.slice(0, 4).map((member) => (
                          <Avatar key={member.id} className="w-8 h-8 border-2 border-white">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {group.members.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">+{group.members.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
