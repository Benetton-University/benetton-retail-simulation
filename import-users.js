const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

// Initialize with Service Role Key
const supabaseAdmin = createClient(
    'https://lttebmghqpahjclycxau.supabase.co', 
    'sb_secret_YXM87Z3htrcOW_jncV9Omg_ObWp0W0w'
);

const results = [];

console.log("Reading CSV file...");

fs.createReadStream('employees.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log(`Found ${results.length} employees. Sending email invites and assigning roles...`);
    
    let successCount = 0;
    let failCount = 0;

    for (const row of results) {
        // 1. Generate the invite link WITHOUT sending an email
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: row.email,
            options: { redirectTo: 'http://127.0.0.1:5500/hub.html' }
        });
        
        if (error) {
            console.error(`❌ Failed to generate link for ${row.email}:`, error.message);
            failCount++;
        } else {
            // 2. Automate Role Assignment
            const rawRole = row.role || row.Role;
            const assignedRole = rawRole ? rawRole.trim().toLowerCase() : 'employee'; 

            const { error: roleError } = await supabaseAdmin
                .from('user_roles')
                .insert([{ email: row.email, role: assignedRole }]);

            if (roleError) {
                console.error(`⚠️ Link generated, but failed to assign role:`, roleError.message);
            } else {
                console.log(`-------------------------------------------`);
                console.log(`✅ Success! User: ${row.email} | Role: ${assignedRole}`);
                console.log(`🔗 COPY & SEND THEM THIS LINK:`);
                console.log(`${data.properties.action_link}`);
                console.log(`-------------------------------------------`);
                successCount++;
            }
        }
    }
    
    console.log("===========================");
    console.log(`FINISHED! Success: ${successCount} | Failed: ${failCount}`);
  });