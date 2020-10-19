using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class BuggyController: BaseApiController
    {
        private readonly DataContext context;

        public BuggyController(DataContext context)
        {
            this.context = context;
        }

        [Authorize]
        [HttpGet("auth")]
        public ActionResult<string> GetSecret(){
            return "secret text";
        }

        
        [HttpGet("not-found")]
        public ActionResult<AppUser> GetNotFound(){
            var thing = context.Users.Find(-1);
            if (thing==null) return NotFound();
            return Ok(thing);
        }

        
        [HttpGet("server-error")]
        public ActionResult<string> GetServerError(){
            var thing = context.Users.Find(-1);
            var thinToReturn = thing.ToString();        
            return thinToReturn;   
            
            // try
            // {
            //  var thing = context.Users.Find(-1);
            // var thinToReturn = thing.ToString();        
            // return thinToReturn;   
            // }
            // catch (System.Exception err)
            // {                
            //     return StatusCode(500, "Computer says no!!!");
            // }            
        }

        
        [HttpGet("bad-request")]
        public ActionResult<string> GetBadRequest(){
            return BadRequest("This was not a good request");
        }

        
    }
}