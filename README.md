# I'm sorry, I had to anonymize
I had to anonymize some names because I'm afraid of bad people

# Staff I'm most curious about
1. How to deal with dialogs/modals when they have basically the same content, but have some behavioral changes based on "mode" create/edit (EdittechnicalStuffDialogComponent -> isEditMode)
2. How to send data from list component to dialog, without reference. As I use it now (AnonymsListComponent -> editAnonymRow(row) -> this.getSafeRowObj(row),), I find it ugly
3. How to compare which data have been changed, and do it in proper types/ with proper values (EditAnonymDialogComponent -> onSaveAnonym)
4. What should go to component and what to services
5. I would like to use TableComponent because I have the same table functionality on multiple pages. But as you can see, there are 9 inputs, and it doesn't even work because I don't know how to make the "filterPredicate" work. I have two sources of filter data, the filter input near the table where user can type. and the warehouse indicator component, which has list of types and when user clicks on some types in there, they apply as a filter and combine with the user filter
6. Any and all advices that you can give me after you stop puking because of my code