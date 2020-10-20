using System;

namespace API.Extensions
{
    public static class DateTimeExtensions
    {
        public static int CalculateAge(this DateTime dob){
            var today = DateTime.Today;
            var age = today.Year - dob.Year;
            return dob.Date > today.AddYears(-age) ? age -1 : age;
        }
        
    }
}