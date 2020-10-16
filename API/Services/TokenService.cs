using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Entities;
using API.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace API.Services
{
    public class TokenService : ITokenService
    {
        private readonly SymmetricSecurityKey _key;
        public TokenService(IConfiguration config)
        {
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["TokenKey"]));
        }

        public string CreateToken(AppUser user)
        {
            //Creo el claims, quien dice ser
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.NameId, user.UserName)
            };

            //Creo la firma
            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

            //Creo como sera el token
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds
            };

            //Creo un manejador de token
            var tokenHandler = new JwtSecurityTokenHandler();

            //Creo el nuevo token
            var token = tokenHandler.CreateToken(tokenDescriptor);

            //Devuelvo el sting del token creado
            return tokenHandler.WriteToken(token);
        }
    }
}