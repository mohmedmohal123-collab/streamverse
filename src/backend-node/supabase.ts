import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://dyunturqerepnwmgbtmh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dW50dXJxZXJlcG53bWdidG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTUwODgsImV4cCI6MjA5NzE5MTA4OH0.BW_EdLtWkCRfx5c6sxUhA2JkU1oxsKAht311EPsBqgs"
);