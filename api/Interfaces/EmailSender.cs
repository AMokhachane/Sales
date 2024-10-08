using System.Net;
using System.Net.Mail;

namespace api.Interfaces
{

    public interface ISenderEmail
    {
        Task SendEmailAsync(string toEmail, string subject, string body, bool isBodyHtml = false);
    }


    public class EmailSender : ISenderEmail
    {
        private readonly SmtpClient _smtpClient;
        private readonly ILogger<EmailSender> _logger;

        public EmailSender(IConfiguration configuration, ILogger<EmailSender> logger)
        {
            _smtpClient = new SmtpClient
            {
                Host = configuration["EmailSettings:Host"],
                Port = int.Parse(configuration["EmailSettings:Port"]),
                EnableSsl = bool.Parse(configuration["EmailSettings:EnableSsl"]),
                Credentials = new NetworkCredential(configuration["EmailSettings:Username"], configuration["EmailSettings:Password"])
            };
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = false)
        {
            try
            {
                var mailMessage = new MailMessage
                {
                    From = new MailAddress("no-reply@example.com"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml
                };

                mailMessage.To.Add(toEmail);

                await _smtpClient.SendMailAsync(mailMessage);

                _logger.LogInformation("Email sent to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                throw;
            }
        }
    }
}