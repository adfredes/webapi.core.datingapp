using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class Seed
    {        
        public static async Task SeedUser(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager){            
            if ( await userManager.Users.AnyAsync()) return;            
            //var userData = await System.IO.File.ReadAllTextAsync("UserSeedDAta.json");                        

            var roles = new List<AppRole>{
                new AppRole{Name = "Member"},
                new AppRole{Name = "Admin"},
                new AppRole{Name = "Moderator"}
            };
            

            foreach (var role in roles)
            {
                await roleManager.CreateAsync(role);
            }

            var userData = await System.IO.File.ReadAllTextAsync("Data/UserSeedDAta.json");            
            var users = JsonSerializer.Deserialize<List<AppUser>>(userData);    
            if(users == null) return;
            
            foreach (var user in users)
            {
                // using var hmac = new HMACSHA512();
                    user.UserName = user.UserName.ToLower();
                    // user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("Pa$$w0rd"));
                    // user.PasswordSalt = hmac.Key;

                    await userManager.CreateAsync(user, "Pa$$w0rd");
                    await userManager.AddToRoleAsync(user, "Member");
            }            

            var admin = new AppUser
            {
                UserName = "admin"
            };

            await userManager.CreateAsync(admin, "Pa$$w0rd");
            await userManager.AddToRolesAsync(admin, new[] {"Admin", "Moderator"});
            //await context.SaveChangesAsync();
        }
    }
}