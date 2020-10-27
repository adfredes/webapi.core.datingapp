using Microsoft.EntityFrameworkCore.Migrations;

namespace API.Data.Migrations
{
    public partial class MessageEntityAdded3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Senderusername",
                table: "Messages",
                newName: "SenderUsername");

            migrationBuilder.RenameColumn(
                name: "Recipientusername",
                table: "Messages",
                newName: "RecipientUsername");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SenderUsername",
                table: "Messages",
                newName: "Senderusername");

            migrationBuilder.RenameColumn(
                name: "RecipientUsername",
                table: "Messages",
                newName: "Recipientusername");
        }
    }
}
