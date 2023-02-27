-- CreateTable
CREATE TABLE "Coach" (
    "id" STRING NOT NULL,
    "displayName" STRING NOT NULL,
    "email" STRING NOT NULL,
    "passwordHash" STRING NOT NULL,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" STRING NOT NULL,
    "coachId" STRING NOT NULL,
    "title" STRING NOT NULL,
    "author" STRING NOT NULL,
    "isbn" STRING,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" STRING NOT NULL,
    "coachId" STRING NOT NULL,
    "lastName" STRING NOT NULL,
    "firstName" STRING NOT NULL,
    "notes" STRING,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" STRING NOT NULL,
    "coachId" STRING NOT NULL,
    "name" STRING NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "View" (
    "memberId" STRING NOT NULL,
    "bookId" STRING NOT NULL,
    "date" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "_BookToTag" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateTable
CREATE TABLE "_MemberToTag" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "View_memberId_bookId_key" ON "View"("memberId", "bookId");

-- CreateIndex
CREATE UNIQUE INDEX "_BookToTag_AB_unique" ON "_BookToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_BookToTag_B_index" ON "_BookToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MemberToTag_AB_unique" ON "_MemberToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_MemberToTag_B_index" ON "_MemberToTag"("B");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookToTag" ADD CONSTRAINT "_BookToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookToTag" ADD CONSTRAINT "_BookToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberToTag" ADD CONSTRAINT "_MemberToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberToTag" ADD CONSTRAINT "_MemberToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
