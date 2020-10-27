using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;

        public AccountController(UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager,
            ITokenService tokenService, IMapper mapper)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _mapper = mapper;
            _tokenService = tokenService;


        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await UserExists(registerDto.Username))
            {
                return BadRequest("Username is taken");
            }
            var user = _mapper.Map<AppUser>(registerDto);
            user.UserName = user.UserName.ToLower();
            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if(!result.Succeeded) return BadRequest(result.Errors);

            var rolesResult = await _userManager.AddToRoleAsync(user, "Member");
            if(!rolesResult.Succeeded) return BadRequest(rolesResult.Errors);

            return new UserDto
            {
                Username = user.UserName,
                Token = await _tokenService.CreateToken(user),
                KnownAs = user.KnownAs,
                Gender = user.Gender
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.Users.Include(x => x.Photos).SingleOrDefaultAsync(x => x.UserName == loginDto.Username.ToLower());

            if (user == null) return Unauthorized("Invalid username or password");

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if(!result.Succeeded) return Unauthorized();

            return new UserDto
            {
                Username = user.UserName,
                Token = await _tokenService.CreateToken(user),
                PhotoUrl = user.Photos.SingleOrDefault(x => x.IsMain == true)?.Url,
                KnownAs = user.KnownAs,
                Gender = user.Gender
            };


        }

        private async Task<bool> UserExists(string username)
        {
            return await _userManager.Users.AnyAsync(x => x.UserName == username.ToLower());
        }

    }
}


// private readonly DataContext _context;
//         private readonly ITokenService _tokenService;
//         private readonly IMapper _mapper;

//         public AccountController(DataContext context, ITokenService tokenService, IMapper mapper)
//         {
//             _mapper = mapper;
//             _tokenService = tokenService;
//             _context = context;

//         }

//         [HttpPost("register")]
//         public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
//         {
//             if (await UserExists(registerDto.Username))
//             {
//                 return BadRequest("Username is taken");
//             }

//             var user = _mapper.Map<AppUser>(registerDto);

//             using var hmac = new HMACSHA512();


//                 user.UserName = user.UserName.ToLower();
//                 user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password));
//                 user.PasswordSalt = hmac.Key;            

//             _context.Users.Add(user);
//             await _context.SaveChangesAsync();

//             return new UserDto
//             {
//                 Username = user.UserName,
//                 Token = _tokenService.CreateToken(user),
//                 KnownAs = user.KnownAs,
//                 Gender = user.Gender
//             };
//         }

//         [HttpPost("login")]
//         public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
//         {
//             var user = await _context.Users.Include(x => x.Photos).SingleOrDefaultAsync(x => x.UserName == loginDto.Username.ToLower());

//             if (user == null) return Unauthorized("Invalid username or password");

//             using var hmac = new HMACSHA512(user.PasswordSalt);

//             var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

//             for (int i = 0; i < computedHash.Length; i++)
//             {
//                 if (computedHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid username or password");
//             }

//             return new UserDto
//             {
//                 Username = user.UserName,
//                 Token = _tokenService.CreateToken(user),
//                 PhotoUrl = user.Photos.SingleOrDefault(x => x.IsMain == true)?.Url,
//                 KnownAs = user.KnownAs,
//                 Gender = user.Gender
//             };


//         }

//         private async Task<bool> UserExists(string username)
//         {
//             return await _context.Users.AnyAsync(x => x.UserName == username.ToLower());
//         }