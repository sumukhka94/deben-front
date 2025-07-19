import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import axios from "axios"

interface User {
  id: number
  name: string
  email: string
}

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onGroupCreated: () => void
}

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)


  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await axios.get("http://localhost:8080/api/users")
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleMemberToggle = (userId: number) => {
    setSelectedMembers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert("Group name is required.")
      return
    }

    if (selectedMembers.length === 0) {
      alert("Please select at least one member.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        createdBy: 1, // TODO: Replace with actual current user ID
        memberIds: selectedMembers,
      }

      await axios.post("http://localhost:8080/api/groups", payload)

      alert("Group created successfully!")

      // Reset form
      setName("")
      setDescription("")
      setSelectedMembers([])
      onGroupCreated()
      onClose()
    } catch (error) {
      console.error("Error creating group:", error)
      alert("Failed to create group. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Group</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupName">Group Name *</Label>
              <Input
                id="groupName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </div>

            <div>
              <Label htmlFor="groupDescription">Description</Label>
              <Textarea
                id="groupDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter group description"
                rows={3}
              />
            </div>
          </div>

          {/* Member Selection */}
          <div>
            <h3 className="text-lg font-medium mb-4">Select Members *</h3>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading users...</div>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {users.length > 0 ? users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                    <Checkbox
                      checked={selectedMembers.includes(user.id)}
                      onCheckedChange={() => handleMemberToggle(user.id)}
                    />
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-gray-500">No users available</div>
                )}
              </div>
            )}

            {selectedMembers.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>{selectedMembers.length}</strong> member{selectedMembers.length !== 1 ? "s" : ""} selected
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim() || selectedMembers.length === 0}>
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}