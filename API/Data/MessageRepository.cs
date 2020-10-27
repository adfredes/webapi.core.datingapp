using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public MessageRepository(DataContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }

        public void AddMessage(Message message)
        {
            _context.Messages.Add(message);
        }

        public void DeleteMessage(Message message)
        {
            _context.Messages.Remove(message);
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages.FindAsync(id);
        }

        public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
        {
            var query = _context.Messages
                .OrderByDescending(m => m.MessageSent)
                .AsQueryable();

            query = messageParams.Container switch
            {
                "Inbox" => query.Where(u => u.RecipientUsername == messageParams.Username && u.RecipientDeleted == false),
                "Outbox" => query.Where(u => u.SenderUsername == messageParams.Username && u.SenderDeleted == false),
                _ => query.Where(u => u.RecipientUsername == messageParams.Username && u.RecipientDeleted == false && u.DateRead == null),
            };

            var message = query.ProjectTo<MessageDto>(_mapper.ConfigurationProvider);
            return await PagedList<MessageDto>.CreateAsync(message, messageParams.PageNumber, messageParams.PageSize);

        }

        public async Task<IEnumerable<MessageDto>> GetMessageThread(string currenUsername, string recipientUsername)
        {
            var messages = await _context.Messages
                .Include(u => u.Sender).ThenInclude(p => p.Photos)
                .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                .Where(u => 
                    u.Recipient.UserName == currenUsername && u.Sender.UserName == recipientUsername && u.RecipientDeleted == false
                    || u.Recipient.UserName == recipientUsername && u.Sender.UserName == currenUsername && u.SenderDeleted == false
                )
                .OrderByDescending(m => m.MessageSent)                
                .ToListAsync();
            
            var unreadMessages = messages.Where(m => m.DateRead == null 
                && m.Recipient.UserName == currenUsername).ToList();
            
            if (unreadMessages.Any()){
                unreadMessages.ForEach(m => m.DateRead = DateTime.Now);
                await SaveAllAsync();
            }
            
            return _mapper.Map<IEnumerable<MessageDto>>(messages);

        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}