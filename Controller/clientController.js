export const addClient = (req,res) => {
   const {name,email} = req.body;
   const anotherUser = clients.find((clients) => clients.email === email);
   if(anotherUser)
   {
    return res.status(400).json({error : "Email exists"});
   }
   addUser({name,email});
   return res.status(201).json({message : "added"});
}