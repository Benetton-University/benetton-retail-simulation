const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

// Initialize with Service Role Key
const supabaseAdmin = createClient(
    'https://lttebmghqpahjclycxau.supabase.co', 
    'sb_secret_YXM87Z3htrcOW_jncV9Omg_ObWp0W0w'
);

const results = [];
const TEMP_PASSWORD = "Benetton2026!"; // The temporary password for everyone

console.log("Reading CSV file...");

fs.createReadStream('employees.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log(`Found ${results.length} employees. Creating accounts with temporary passwords...`);
    
    let successCount = 0;
    let failCount = 0;

    for (const row of results) {
        // 1. Create the user with a specific password
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: row.email,
            password: TEMP_PASSWORD,
            email_confirm: true // Automatically "verifies" them so they don't need to check email
        });
        
        if (error) {
            // If they already exist, we just skip the creation and try role assignment
            if (error.message.includes("already registered")) {
                console.log(`ℹ️ ${row.email} already has an account. Proceeding to role check...`);
            } else {
                console.error(`❌ Failed to create ${row.email}:`, error.message);
                failCount++;
                continue;
            }
        }

        // 2. Automate Role Assignment (Same logic as before)
        const rawRole = row.role || row.Role;
        const assignedRole = rawRole ? rawRole.trim().toLowerCase() : 'employee'; 

        const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .upsert([{ email: row.email, role: assignedRole }], { onConflict: 'email' });

        if (roleError) {
            console.error(`⚠️ Account created for ${row.email}, but failed to assign role:`, roleError.message);
        } else {
            console.log(`✅ Success! ${row.email} created. Role: ${assignedRole}`);
            successCount++;
        }
    }
    
    console.log("===========================");
    console.log(`FINISHED! Accounts ready for login.`);
    console.log(`Login URL: https://sojaosid.github.io/benetton-retail-simulation/`);
    console.log(`Default Password: ${TEMP_PASSWORD}`);
    console.log("===========================");
  });