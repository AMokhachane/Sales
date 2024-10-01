using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Models
{
    public class Product
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }  = string.Empty;
        public string Url { get; set; } = string.Empty;
        public List<Category> Categories { get; set; } = new List<Category>();
        public List<Sale> Sales { get; set; } = new List<Sale>();
        public string AppUserId { get; set; }
        public AppUser AppUser { get; set; }

    }
}