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
import { syncNow, getFetchStatus, getAllUserProfiles, updateUserProfile, UserProfile, createUserProfile } from "../utils/supabase";
import { format, parseISO, isValid } from "date-fns";

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
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newUserData, setNewUserData] = useState({
    phone: "",
    profile_type: "user",
    name: "",
    email: ""
  });
  const [editUserData, setEditUserData] = useState({
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
        fetchUsers();
      } catch (error) {
        console.error("Error checking authentication:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const userProfiles = await getAllUserProfiles();
      console.log("Fetched user profiles:", userProfiles);
      setUsers(userProfiles);
      setPageLoading(false);
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      toast.error("Failed to load user profiles");
      setPageLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.phone && user.phone.includes(searchQuery)) || 
    (user.profile_type && user.profile_type.includes(searchQuery)) ||
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.patient_name && user.patient_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddUser = async () => {
    // Validate form
    if (!newUserData.phone || !newUserData.profile_type) {
      toast.error("Phone number and user type are required");
      return;
    }
    
    try {
      toast.loading("Creating new user...", { id: "create-user" });
      
      // Use the createUserProfile function to create a new user in the database
      const additionalData = {
        name: newUserData.name || "User"
      };
      
      const createdUser = await createUserProfile(
        newUserData.phone, 
        newUserData.profile_type,
        additionalData
      );
      
      if (createdUser) {
        toast.dismiss("create-user");
        toast.success(`User added successfully: ${newUserData.phone}`);
        
        // Refresh the user list to include the new user
        fetchUsers();
        
        // Close the dialog and reset form
        setIsAddUserOpen(false);
        setNewUserData({
          phone: "",
          profile_type: "user",
          name: "",
          email: ""
        });
      } else {
        toast.dismiss("create-user");
        toast.error("Failed to create user. Please try again.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.dismiss("create-user");
      toast.error("An error occurred while creating the user");
    }
  };

  const handleOpenEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setEditUserData({
      phone: user.phone || "",
      profile_type: user.profile_type || "user",
      name: user.name || user.patient_name || "",
      email: user.email || ""
    });
    setIsEditUserOpen(true);
  };

  const handleEditUser = async () => {
    if (!selectedUser) {
      toast.error("No user selected for editing");
      return;
    }

    // Validate form
    if (!editUserData.phone || !editUserData.profile_type) {
      toast.error("Phone number and user type are required");
      return;
    }

    try {
      // Prepare update data
      const updateData = {
        phone: editUserData.phone,
        profile_type: editUserData.profile_type,
        patient_name: editUserData.name, // Update patient_name field
      };

      // Update the user in Supabase
      const updatedUser = await updateUserProfile(selectedUser.id, updateData);
      
      if (updatedUser) {
        // Update the user in the local state
        const updatedUsers = users.map(u => 
          u.id === selectedUser.id ? { ...u, ...updatedUser } : u
        );
        setUsers(updatedUsers);
        
        toast.success("User updated successfully");
        setIsEditUserOpen(false);
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("An error occurred while updating the user");
    }
  };

  const handleDeleteUser = (userId: string) => {
    // In a real implementation, this would delete the user from Supabase
    // For now, we'll just remove it from the local state
    const filteredUsers = users.filter(user => user.id !== userId);
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
      
      // Refresh the user list after sync
      fetchUsers();
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

  const formatDateString = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    
    // Try parsing as ISO date first
    if (dateString.includes("T") && dateString.includes("Z")) {
      const parsedDate = parseISO(dateString);
      if (isValid(parsedDate)) {
        return format(parsedDate, 'MM/dd/yyyy hh:mm a');
      }
    }
    
    // If not ISO format, return as is
    return dateString;
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

                  {/* Edit User Dialog */}
                  <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                          Update user account information.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="editPhone" className="text-sm font-medium text-gray-700">
                              Phone Number
                            </label>
                            <Input 
                              id="editPhone" 
                              placeholder="+1234567890" 
                              value={editUserData.phone}
                              onChange={(e) => setEditUserData({...editUserData, phone: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="editName" className="text-sm font-medium text-gray-700">
                              Name
                            </label>
                            <Input 
                              id="editName" 
                              placeholder="User Name" 
                              value={editUserData.name}
                              onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="editEmail" className="text-sm font-medium text-gray-700">
                              Email (Optional)
                            </label>
                            <Input 
                              id="editEmail" 
                              type="email"
                              placeholder="user@example.com" 
                              value={editUserData.email}
                              onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="editUserType" className="text-sm font-medium text-gray-700">
                              User Type
                            </label>
                            <select
                              id="editUserType"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-health-500"
                              value={editUserData.profile_type}
                              onChange={(e) => setEditUserData({...editUserData, profile_type: e.target.value})}
                            >
                              <option value="patient">Patient</option>
                              <option value="user">Regular User</option>
                              <option value="admin">Administrator</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditUserOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="health"
                          onClick={handleEditUser}
                        >
                          Save Changes
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
                          <TableRow key={user.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="bg-gray-100 rounded-full p-2">
                                  {user.profile_type === 'admin' ? 
                                    <Shield className="h-5 w-5 text-purple-500" /> : 
                                    <UserRound className="h-5 w-5 text-blue-500" />
                                  }
                                </div>
                                <div>
                                  <div className="font-medium">{user.name || user.patient_name || "Unknown User"}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{user.phone}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.profile_type === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                user.profile_type === 'patient' ? 'bg-green-100 text-green-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {user.profile_type}
                              </span>
                            </TableCell>
                            <TableCell>
                              {user.created_date ? 
                                formatDateString(user.created_date) : 
                                user.created_at ? 
                                formatDateString(user.created_at) : 
                                "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEditUser(user)}
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
