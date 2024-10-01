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
using api.Dtos.Account;

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
public async Task<ActionResult> RegisterUser([FromBody] RegisterDto userDto)
{
    try
    {
        // Create a new user object
        AppUser newUser = new AppUser
        {
            Email = userDto.EmailAddress,
            UserName = userDto.Username,
        };

        // Create the user in the database
        var result = await userManager.CreateAsync(newUser, userDto.Password);

        // Check if user creation was successful
        if (!result.Succeeded)
        {
            var errorMessages = result.Errors.Select(e => e.Description).ToList();
            logger.LogWarning("User registration failed: {Errors}", string.Join(", ", errorMessages));
            return BadRequest(new { errors = errorMessages });
        }

        // Generate and send the confirmation email
        string confirmationLink = await GenerateEmailConfirmationLink(newUser);
        await SendConfirmationEmail(newUser.Email, confirmationLink);

        // Return simplified success response
        return Ok(new
        {
            message = "Registered Successfully. Please check your email to confirm your account."
        });
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error occurred during user registration.");
        return BadRequest(new { message = "Something went wrong, please try again. " + ex.Message });
    }
}

// Helper methods for email confirmation
private async Task<string> GenerateEmailConfirmationLink(AppUser newUser)
{
    var token = await userManager.GenerateEmailConfirmationTokenAsync(newUser);
    var encodedToken = WebUtility.UrlEncode(token);
    var confirmationLink = Url.Action(nameof(ConfirmEmail), "Account", new { email = newUser.Email, token = encodedToken }, Request.Scheme);
    return confirmationLink;
}

private async Task SendConfirmationEmail(string email, string confirmationLink)
{
    string confirmationEmailTemplate = $@"
        <h1>Welcome to Image App Gallery</h1>
        <p>Please click the link below to confirm your email:</p>
        <a href='{confirmationLink}'>Confirm Email</a>
    ";

    await emailSender.SendEmailAsync(email, "Email Confirmation", confirmationEmailTemplate, true);
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