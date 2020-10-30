using System;
using API.Data;
using API.Helpers;
using API.Interfaces;
using API.Services;
using API.SignalR;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace API.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config){
            services.AddSingleton<PresenceTracker>();
            services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));            
            services.AddScoped<IPhotoService, PhotoService>();
            services.AddScoped<ITokenService, TokenService>();
            //services.AddScoped<IMessageRepository, MessageRepository>();
            //services.AddScoped<ILikesRepository, LikesRepository>();
            //services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<LogUserActivity>();            
            services.AddAutoMapper(typeof(AutoMapperProfiles).Assembly);
            
            // services.AddDbContext<DataContext>(options =>
            // {
            //     options.UseNpgsql(config.GetConnectionString("DefaultConnection"));
            // });

            services.AddDbContext<DataContext>(options =>
            {
                var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

                string connStr;

                // Depending on if in development or production, use either Heroku-provided
                // connection string, or development connection string from env var.
                if (env == "Development")
                {
                    // Use connection string from file.
                    connStr = config.GetConnectionString("DefaultConnection");
                    var connUrl = Environment.GetEnvironmentVariable("DATABASE_URL");                                        
                }
                else
                {
                    // Use connection string provided at runtime by Heroku.
                    var connUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
                    //connUrl = "postgres://kvxnprjcevwyht:cc5441e7c5bc66972fe1bd6291f2d693ef3dc453e578c85ad4597ea3186f0762@ec2-3-216-92-193.compute-1.amazonaws.com:5432/d1jsestqkit0dq";
                    // Parse connection URL to connection string for Npgsql
                    connUrl = connUrl.Replace("postgres://", string.Empty);
                    var pgUserPass = connUrl.Split("@")[0];
                    var pgHostPortDb = connUrl.Split("@")[1];
                    var pgHostPort = pgHostPortDb.Split("/")[0];
                    var pgDb = pgHostPortDb.Split("/")[1];
                    var pgUser = pgUserPass.Split(":")[0];
                    var pgPass = pgUserPass.Split(":")[1];
                    var pgHost = pgHostPort.Split(":")[0];
                    var pgPort = pgHostPort.Split(":")[1];
                    // var pgDb = "d1jsestqkit0dq";
                    // var pgUser = "kvxnprjcevwyht";
                    // var pgPass = "cc5441e7c5bc66972fe1bd6291f2d693ef3dc453e578c85ad4597ea3186f0762";
                    // var pgHost = "ec2-3-216-92-193.compute-1.amazonaws.com";
                    // var pgPort = "5432";

                    connStr = $"Server={pgHost};Port={pgPort};User Id={pgUser};Password={pgPass};Database={pgDb}";
                }

                // Whether the connection string came from the local development configuration file
                // or from the environment variable from Heroku, use it to set up your DbContext.
                options.UseNpgsql(connStr);
            });


            return services;
        }
        
    }
}