using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using api.Models;
using api.Data;
using api.Interfaces;

namespace api.Controllers
{
    [Route("api/accounts")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly SignInManager<AppUser> signInManager;
        private readonly UserManager<AppUser> userManager;
        private readonly ISenderEmail emailSender;
        private readonly ILogger<AccountController> logger;
        private readonly ApplicationDBContext dbContext;

        public AccountController(
            SignInManager<AppUser> sm,
            UserManager<AppUser> um,
            ISenderEmail es,
            ILogger<AccountController> logger,
            ApplicationDBContext dbContext)
        {
            signInManager = sm;
            userManager = um;
            emailSender = es;
            this.logger = logger;
            this.dbContext = dbContext;
        }

        private string ModifyConfirmationLink(string confirmationLink)
        {
            return confirmationLink.Replace("api/Sales/", "");
        }

        // Endpoint for registering a new user
        [HttpPost("register")]
        public async Task<ActionResult> RegisterUser(AppUser user)
        {
            try
            {
                // Create a new user object
                AppUser newUser = new AppUser
                {

                    Email = user.Email,
                    UserName = user.UserName,

                };

                // Create the user in the database
                var result = await userManager.CreateAsync(newUser, user.PasswordHash);

                // Check if user creation was successful
                if (!result.Succeeded)
                {
                    var errorMessages = result.Errors.Select(e => e.Description).ToList();
                    logger.LogWarning("User registration failed: {Errors}", string.Join(", ", errorMessages));
                    return BadRequest(new { errors = errorMessages });
                }

                // Add password history for the user
                dbContext.PasswordHistories.Add(new PasswordHistory
                {
                    UserId = newUser.Id,
                    PasswordHash = userManager.PasswordHasher.HashPassword(newUser, user.PasswordHash)
                });
                await dbContext.SaveChangesAsync();

                // Generate email confirmation token
                var token = await userManager.GenerateEmailConfirmationTokenAsync(newUser);
                logger.LogInformation("Email confirmation token generated for user {UserId}", newUser.Id);

                // Store the email confirmation token
                await userManager.SetAuthenticationTokenAsync(newUser, "CustomProvider", "EmailConfirmation", token);

                // Generate and log the confirmation link
                var encodedToken = WebUtility.UrlEncode(token);
                var confirmationLink = Url.Action(nameof(ConfirmEmail), "Account", new { email = newUser.Email, token = encodedToken }, Request.Scheme);
                logger.LogInformation("Confirmation link generated: {ConfirmationLink}", confirmationLink);

                // Modify and log the confirmation link
                var modifiedLink = ModifyConfirmationLink(confirmationLink);
                logger.LogInformation("Modified confirmation link: {ModifiedLink}", modifiedLink);

                // Send the confirmation email
                // Email template for registration confirmation
                string confirmationEmailTemplate = $@"
    <h1>Welcome to Image App Gallery</h1>
    <h3>Dear </h3>
    <p>We are thrilled to have you join our community. At <span style='color: #2187AB;'>ImageApp Gallery</span>, we strive to provide you with the best experience for exploring and sharing stunning images.</p>
    <p>Thank you for signing up! Here are a few things you can do to get started:</p>
    <ul>
        <li>Explore our extensive collection of images.</li>
        <li>Upload and share your own amazing photos.</li>
        <li>Connect with other photography enthusiasts.</li>
    </ul>
    <div style='padding: 0 0 10px;'>
        <h4>Before you can login, please click the button below to activate your account.</h4>
        <a href='{modifiedLink}'
        style='
            padding: 10px 15px;
            border-radius: 4px;
            margin: 10px auto;
            background-color: #2187AB;
            color: #E9F5F9; 
            height: 40px;
            text-decoration: none;'
        >Confirm Email
        </a>
    </div>
    <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
    <h4>Signature</h4>
    <p>Best regards,</p>
    <p>The ImageApp Gallery Team</p>";

                await emailSender.SendEmailAsync(user.Email, "Image Gallery App Email Confirmation", confirmationEmailTemplate, true);
                logger.LogInformation("Confirmation email sent to {Email}", user.Email);

                // Return success response
                return Ok(new { message = "Registered Successfully. Please check your email to confirm your account." });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during user registration.");
                return BadRequest(new { message = "Something went wrong, please try again. " + ex.Message });
            }
        }

        // Endpoint to confirm email
        [HttpGet("confirmemail")]
        public async Task<IActionResult> ConfirmEmail(string token, string email)
        {
            logger.LogInformation("ConfirmEmail endpoint hit with token: {Token} and email: {Email}", token, email);

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token))
            {
                logger.LogWarning("Email or token is null or empty.");
                return BadRequest(new { message = "Email and Token are required." });
            }

            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                logger.LogWarning("User with email {Email} not found.", email);
                return BadRequest(new { message = "User not found." });
            }

            var decodedToken = WebUtility.UrlDecode(token);
            var result = await userManager.ConfirmEmailAsync(user, decodedToken);

            if (result.Succeeded)
            {
                logger.LogInformation("User with email {Email} successfully confirmed email.", email);
                return Ok(new { message = "Email confirmed successfully!" });
            }

            logger.LogError("Error confirming email for user with email {Email}: {Error}", email, result.Errors.FirstOrDefault()?.Description);
            return BadRequest(new { message = "Error confirming your email." });
        }

        // Endpoint to login a user
        [HttpPost("login")]
        public async Task<ActionResult> LoginUser(Login login)
        {
            try
            {
                // Validate the login model
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var user = await userManager.FindByEmailAsync(login.Email);
                if (user == null)
                {
                    logger.LogWarning("Login attempt failed for non-existent email {Email}", login.Email);
                    return BadRequest(new { message = "Please check your credentials and try again." });
                }

                if (!user.EmailConfirmed)
                {
                    logger.LogWarning("Login attempt for unconfirmed email {Email}", login.Email);
                    return Unauthorized(new { message = "Email not confirmed yet." });
                }

                // Attempt to sign in the user without the Remember parameter
                var result = await signInManager.PasswordSignInAsync(user.UserName, login.Password, isPersistent: false, lockoutOnFailure: true);

                if (result.Succeeded)
                {
                    logger.LogInformation("User {UserId} logged in successfully", user.Id);
                    return Ok(new { message = "Login successful.", userEmail = user.Email, userID = user.Id });
                }

                if (result.RequiresTwoFactor)
                {
                    logger.LogWarning("Two-factor authentication required for user {UserId}", user.Id);
                    return BadRequest(new { message = "Two-factor authentication required." });
                }

                if (result.IsLockedOut)
                {
                    logger.LogWarning("User {UserId} is locked out", user.Id);
                    return BadRequest(new { message = "Account locked out due to multiple failed login attempts." });
                }

                logger.LogWarning("Invalid login attempt for user {UserId}", user.Id);
                return Unauthorized(new { message = "Check your login credentials and try again." });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during login.");
                return BadRequest(new { message = "An error occurred. Please try again." });
            }
        }
    }
}