using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class LikesRepository : ILikesRepository
    {
        private readonly DataContext _context;
        public LikesRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<UserLike> GetUserLike(int sourceUsedId, int likedUserId)
        {
            return await _context.Likes.FindAsync(sourceUsedId, likedUserId);
        }

        public async Task<PagedList<LikeDto>> GetUserLikes(LikesParams likesParams)
        {
            var users = _context.Users.OrderBy(u => u.UserName).AsQueryable();
            var likes = _context.Likes.AsQueryable();

            if(likesParams.Predicate == "liked"){
                likes = likes.Where(like => like.SourceUserId == likesParams.UserId);
                users = likes.Select(like => like.LikedUser);
            }
            if(likesParams.Predicate == "likedBy"){
                likes = likes.Where(like => like.LikedUserId == likesParams.UserId);
                users = likes.Select(like => like.SourceUser);
            }

            var likedUser =  users.Select(user => new LikeDto{
                Age = user.DateOfBirth.CalculateAge(),
                City = user.City,
                Username = user.UserName,
                Id = user.Id,                
                KnownAs = user.KnownAs,
                PhotoUrl = user.Photos.FirstOrDefault(photo => photo.IsMain).Url
            });

            return await PagedList<LikeDto>.CreateAsync(likedUser, likesParams.PageNumber, likesParams.PageSize);
        }

        public async Task<AppUser> GetUserWhithLikes(int userId)
        {
            return await _context.Users
                        .Include(x => x.LikedUsers)
                        .FirstOrDefaultAsync(x => x.Id == userId);
                        
        }
    }
}