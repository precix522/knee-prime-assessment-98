import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useTwilioAuthStore } from "../utils/auth";
import { Users, UserPlus, Edit, Trash, Search, UserRound, Shield, RefreshCw } from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { syncNow, getFetchStatus, getAllUserProfiles, UserProfile } from "../utils/supabase";

type User = {
  id: string;
  phone: string;
  profile_type: string;
  created_at: string;
  name?: string;
  email?: string;
};

export default function ManageUsers() {
  const { user, isLoading } = useTwilioAuthStore();
  const [pageLoading, setPageLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    phone: "",
    profile_type: "user",
    name: "",
    email: ""
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [fetchStatus, setFetchStatus] = useState({
    lastFetchTime: null as Date | null,
    currentlyFetching: false,
    objectCount: 0,
    error: null as string | null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Set up a periodic status check (every 10 seconds)
    const statusCheckInterval = setInterval(() => {
      const status = getFetchStatus();
      setFetchStatus(status);
      setIsSyncing(status.currentlyFetching);
    }, 10000);

    // Initial check
    const status = getFetchStatus();
    setFetchStatus(status);
    setIsSyncing(status.currentlyFetching);

    return () => {
      clearInterval(statusCheckInterval);
    };
  }, []);

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
        
        // Fetch real user profiles from Supabase
        const fetchUsers = async () => {
          try {
            const userProfiles = await getAllUserProfiles();
            setUsers(userProfiles);
            setPageLoading(false);
          } catch (error) {
            console.error("Error fetching user profiles:", error);
            toast.error("Failed to load user profiles");
            setPageLoading(false);
          }
        };
        
        fetchUsers();
      } catch (error) {
        console.error("Error checking authentication:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [user, navigate]);

  const filteredUsers = users.filter(user => 
    (user.phone && user.phone.includes(searchQuery)) || 
    (user.profile_type && user.profile_type.includes(searchQuery)) ||
    (user.patient_name && user.patient_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddUser = async () => {
    // Validate form
    if (!newUserData.phone || !newUserData.profile_type) {
      toast.error("Phone number and user type are required");
      return;
    }
    
    // In a real implementation, this would create a new user in Supabase
    // For now, we'll just add it to the local state
    // In a future implementation, you should add an API call to create the user in Supabase
    const newUser: UserProfile = {
      Patient_ID: `usr${Date.now()}`,
      phone: newUserData.phone,
      profile_type: newUserData.profile_type,
      patient_name: newUserData.name || null,
      // Other fields would be null or have default values
    };
    
    setUsers([...users, newUser]);
    setIsAddUserOpen(false);
    setNewUserData({
      phone: "",
      profile_type: "user",
      name: "",
      email: ""
    });
    
    toast.success(`User added successfully: ${newUserData.phone}`);
  };

  const handleEditUser = (userId: string) => {
    toast.info(`Edit user ${userId} feature will be implemented in the future`);
  };

  const handleDeleteUser = (userId: string) => {
    // In a real implementation, this would delete the user from Supabase
    // For now, we'll just remove it from the local state
    const filteredUsers = users.filter(user => user.Patient_ID !== userId);
    setUsers(filteredUsers);
    toast.success("User deleted successfully");
  };

  const handleSyncNow = async () => {
    if (isSyncing) {
      toast.info("Sync already in progress");
      return;
    }

    setIsSyncing(true);
    try {
      await syncNow();
      const status = getFetchStatus();
      setFetchStatus(status);
    } catch (error) {
      console.error("Error syncing data:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleString();
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

      <main className="flex-grow pt-24 pb-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg shadow-md overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Users className="h-6 w-6 mr-2 text-white" />
                  Manage Users
                </h1>
                <div className="flex gap-2">
                  <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="secondary" 
                        className="flex items-center bg-white text-orange-600 hover:bg-orange-50"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Create a new user account in the system.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                              Phone Number
                            </label>
                            <Input 
                              id="phone" 
                              placeholder="+1234567890" 
                              value={newUserData.phone}
                              onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-gray-700">
                              Name (Optional)
                            </label>
                            <Input 
                              id="name" 
                              placeholder="User Name" 
                              value={newUserData.name}
                              onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                              Email (Optional)
                            </label>
                            <Input 
                              id="email" 
                              type="email"
                              placeholder="user@example.com" 
                              value={newUserData.email}
                              onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="userType" className="text-sm font-medium text-gray-700">
                              User Type
                            </label>
                            <select
                              id="userType"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-health-500"
                              value={newUserData.profile_type}
                              onChange={(e) => setNewUserData({...newUserData, profile_type: e.target.value})}
                            >
                              <option value="user">Regular User</option>
                              <option value="admin">Administrator</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsAddUserOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="health"
                          onClick={handleAddUser}
                        >
                          Add User
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="secondary"
                    onClick={() => navigate('/dashboard')}
                    className="bg-white text-orange-600 hover:bg-orange-50"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-b-lg shadow-md overflow-hidden">
              {/* S3 Sync Status Section */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">AWS S3 Synchronization</h2>
                    <div className="space-y-1">
                      <div className="flex gap-2 items-center text-sm">
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          fetchStatus.currentlyFetching 
                            ? 'bg-blue-100 text-blue-800' 
                            : fetchStatus.error 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {fetchStatus.currentlyFetching 
                            ? 'Syncing...' 
                            : fetchStatus.error 
                              ? 'Error' 
                              : 'Ready'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Last sync:</span> {formatDate(fetchStatus.lastFetchTime)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Objects synced:</span> {fetchStatus.objectCount}
                      </div>
                      {fetchStatus.error && (
                        <div className="text-sm text-red-600">
                          <span className="font-medium">Error:</span> {fetchStatus.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button 
                      onClick={handleSyncNow} 
                      disabled={isSyncing}
                      className="flex items-center"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? "Syncing..." : "Sync Now"}
                    </Button>
                  </div>
                </div>
                {isSyncing && (
                  <div className="mt-3">
                    <Progress value={100} className="animate-pulse" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="mb-6 relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search users by phone, name, email..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-health-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {filteredUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableCaption>List of all users in the system</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User Info</TableHead>
                          <TableHead>Phone Number</TableHead>
                          <TableHead>User Type</TableHead>
                          <TableHead>Created Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.Patient_ID} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="bg-gray-100 rounded-full p-2">
                                  {user.profile_type === 'admin' ? 
                                    <Shield className="h-5 w-5 text-purple-500" /> : 
                                    <UserRound className="h-5 w-5 text-blue-500" />
                                  }
                                </div>
                                <div>
                                  <div className="font-medium">{user.patient_name || "Unknown User"}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{user.phone}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.profile_type === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.profile_type}
                              </span>
                            </TableCell>
                            <TableCell>{user.last_modified_tm ? new Date(user.last_modified_tm).toLocaleDateString() : "N/A"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(user.Patient_ID)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.Patient_ID)}
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
                  </div>
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
