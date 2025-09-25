// Simple script to create sample tasks
const sampleTasks = [
  {
    title: "Platform Verification Task",
    description: "Verify that the new task management system is working properly",
    status: "todo",
    scope: "general",
    priority: "high"
  },
  {
    title: "Update Talent Profiles",
    description: "Review and update talent profile information for accuracy",
    status: "in_progress",
    scope: "talent",
    priority: "medium"
  },
  {
    title: "Booking Follow-up",
    description: "Follow up with clients on pending booking requests",
    status: "todo",
    scope: "booking",
    priority: "high"
  },
  {
    title: "System Maintenance",
    description: "Perform routine system maintenance and updates",
    status: "done",
    scope: "general",
    priority: "low"
  }
];

console.log("Sample tasks to create:", JSON.stringify(sampleTasks, null, 2));
