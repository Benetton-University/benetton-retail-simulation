require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

// Initialize with Service Role Key
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const results = [];
const TEMP_PASSWORD = process.env.TEMP_PASSWORD;

console.log("Reading CSV file...");

fs.createReadStream('employees.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('error', (err) => console.error('❌ Failed to read CSV:', err.message))
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
        
        const rawRole = row.role || row.Role;
        const assignedRole = rawRole ? rawRole.trim().toLowerCase() : 'employee';
        const name = row.name || row.Name || null;

        if (error) {
            if (error.message.toLowerCase().includes("already") && error.message.toLowerCase().includes("registered")) {
                console.log(`ℹ️ ${row.email} already has an account. Updating name and role...`);
                const { error: updateError } = await supabaseAdmin
                    .from('user_roles')
                    .update({ role: assignedRole, name })
                    .eq('email', row.email);
                if (updateError) {
                    console.error(`⚠️ Failed to update ${row.email}:`, updateError.message);
                    failCount++;
                } else {
                    console.log(`✅ Updated ${row.email}. Role: ${assignedRole}`);
                    successCount++;
                }
            } else {
                console.error(`❌ Failed to create ${row.email}:`, error.message);
                failCount++;
            }
            continue;
        }

        // New user — insert their role and name
        const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert([{ email: row.email, role: assignedRole, name }]);

        if (roleError) {
            console.error(`⚠️ Account created for ${row.email}, but failed to assign role:`, roleError.message);
        } else {
            console.log(`✅ Success! ${row.email} created. Role: ${assignedRole}`);
            successCount++;
        }
    }
    
    console.log("===========================");
    console.log(`FINISHED! Accounts ready for login.`);
    console.log(`Succeeded: ${successCount} | Failed: ${failCount}`);
    console.log(`Login URL: https://benetton-university.github.io/benetton-retail-simulation/`);
    console.log(`Default Password: ${TEMP_PASSWORD}`);
    console.log("===========================");
  });