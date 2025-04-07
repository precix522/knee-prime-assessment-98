
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Users, UserPlus, Edit, Trash, Search } from "lucide-react";
import { Button } from "../components/Button";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";

type User = {
  id: string;
  phone: string;
  profile_type: string;
  created_at: string;
};

export default function ManageUsers() {
  const { user, isLoading } = useTwilioAuthStore();
  const [pageLoading, setPageLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user) {
          navigate("/login");
          return;
        }
        
        if (user.profile_type !== 'admin') {
          toast.error("You don't have permission to access this page");
          navigate("/dashboard");
          return;
        }
        
        // In a real implementation, we would fetch users from Supabase here
        // For now, let's use dummy data
        const dummyUsers: User[] = [
          {
            id: "usr1",
            phone: "+1234567890",
            profile_type: "admin",
            created_at: "2023-04-01"
          },
          {
            id: "usr2",
            phone: "+9876543210",
            profile_type: "user",
            created_at: "2023-04-02"
          },
          {
            id: "usr3",
            phone: "+1122334455",
            profile_type: "user",
            created_at: "2023-04-03"
          }
        ];
        
        setUsers(dummyUsers);
        setPageLoading(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [user, navigate]);

  const filteredUsers = users.filter(user => 
    user.phone.includes(searchQuery) || 
    user.profile_type.includes(searchQuery)
  );

  const handleAddUser = () => {
    toast.info("Add user feature will be implemented in the future");
  };

  const handleEditUser = (userId: string) => {
    toast.info(`Edit user ${userId} feature will be implemented in the future`);
  };

  const handleDeleteUser = (userId: string) => {
    toast.info(`Delete user ${userId} feature will be implemented in the future`);
  };

  if (pageLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-health-600" />
                Manage Users
              </h1>
              <Button 
                variant="health" 
                onClick={handleAddUser}
                className="flex items-center"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="mb-6 relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-health-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {filteredUsers.length > 0 ? (
                  <Table>
                    <TableCaption>List of all users in the system</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>User Type</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.phone}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.profile_type === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.profile_type}
                            </span>
                          </TableCell>
                          <TableCell>{user.created_at}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(user.id)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                    <p className="text-gray-500">
                      {searchQuery ? "No users match your search criteria." : "There are no users in the system yet."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
