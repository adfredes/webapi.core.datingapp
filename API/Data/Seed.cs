using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class Seed
    {
        public static async Task SeedUser(DataContext context){
            if ( await context.Users.AnyAsync()) return;

            var userData = await System.IO.File.ReadAllTextAsync("Data/UserSeedDAta.json");
            var users = JsonSerializer.Deserialize<List<AppUser>>(userData);
            users.ForEach(user => {
                    using var hmac = new HMACSHA512();
                    user.UserName = user.UserName.ToLower();
                    user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("Pa$$w0rd"));
                    user.PasswordSalt = hmac.Key;

                    context.Users.Add(user);
            });

            await context.SaveChangesAsync();
        }
    }
}