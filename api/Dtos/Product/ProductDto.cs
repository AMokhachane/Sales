using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models;

namespace api.Dtos.Product
{
    public class ProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }  = string.Empty;
        public string Url { get; set; } = string.Empty;
        public List<Category> Categories { get; set; } = new List<Category>();
        public List<Sale> Sales { get; set; } = new List<Sale>();
    }
}