import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import axios from "axios"
import CreateGroupModal from "./CreateGroupModal"

interface Group {
  id: number
  name: string
  description: string
  members: Array<{
    id: number
    name: string
    avatar: string
  }>
  totalExpenses: number
  expenseCount: number
}

export default function HomePage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const response = await axios.get("http://localhost:8080/home")
      setGroups(response.data)
    } catch (error) {
      console.error("Error fetching groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGroupCreated = () => {
    fetchGroups()
  }

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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Groups</h1>
            <p className="mt-2 text-gray-600">Manage and track expenses across different groups</p>
          </div>
          <Button onClick={() => setShowCreateGroup(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading groups...</div>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No groups found</div>
            <Button onClick={() => setShowCreateGroup(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Group
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow relative">
                <Link to={`/group/${group.id}`}>
                  <CardHeader className="cursor-pointer">
                    <CardTitle className="flex items-center justify-between pr-8">
                      {group.name}
                      <Badge variant="secondary">{group.expenseCount} expenses</Badge>
                    </CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="cursor-pointer">
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
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  )
}
