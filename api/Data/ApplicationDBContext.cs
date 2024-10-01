using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using api.Models;

namespace api.Data
{
    public class ApplicationDBContext : IdentityDbContext<AppUser>
  {

        public ApplicationDBContext(DbContextOptions dbContextOptions)
    : base(dbContextOptions)
    {

    }
    public DbSet<Product> Products { get; set; }
    public DbSet<Sale> Sales { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<AppUser> AppUsers { get; set; }
    public DbSet<PasswordHistory> PasswordHistories { get; set; }


    protected override void OnModelCreating(ModelBuilder builder)
    {
      base.OnModelCreating(builder);

       builder.Entity<AppUser>()
                .Property(u => u.Id)
                .HasColumnName("AppUserId");

                 builder.Entity<Product>()
                .HasOne(i => i.AppUser)
                .WithMany(u => u.Products)
                .HasForeignKey(i => i.AppUserId);

                 

      List<IdentityRole> roles = new List<IdentityRole>
            {
              new IdentityRole
              {
                Name = "Admin",
                NormalizedName = "ADMIN"
              },

                 new IdentityRole
              {
                Name = "User",
                NormalizedName = "USER"
              },
            };
      builder.Entity<IdentityRole>().HasData(roles);
    }

  }
}