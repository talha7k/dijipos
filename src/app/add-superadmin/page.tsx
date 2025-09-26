// "use client";

// import { useEffect, useState } from "react";
// import { useAuth } from "@/lib/hooks/useAuth";
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase/config";

// const AddSuperAdminPage = () => {
//   const { user } = useAuth();
//   const [message, setMessage] = useState("Processing...");

//   useEffect(() => {
//     const addSuperAdmin = async () => {
//       if (user) {
//         try {
//           await setDoc(doc(db, "super-admins", user.uid), {
//             createdAt: new Date(),
//           });
//           setMessage("You have been added as a super-admin.");
//         } catch (error) {
//           console.error("Error adding super-admin:", error);
//           setMessage("An error occurred while adding you as a super-admin.");
//         }
//       } else {
//         setMessage("You must be logged in to become a super-admin.");
//       }
//     };

//     addSuperAdmin();
//   }, [user]);

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Add Super Admin</h1>
//       <p>{message}</p>
//     </div>
//   );
// };

// export default AddSuperAdminPage;
//
export default function Page() {
  return <h1>Page does not exist</h1>;
}
