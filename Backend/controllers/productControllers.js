import catchAysncErrors from "../middlewares/catchAysncErrors.js";
import Product from "../models/product.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
import errorHandler from "../utils/errorHandler.js";

// here we create new products  => /api/vi/products
export const getProducts = catchAysncErrors(async (req, res,next) => {
const resPerPage = 4
const apiFilters = new APIFilters(Product,req.query).search().filters();// here we use the search products fucntion.

console.log("reg.user",req?.user);

let products = await apiFilters.query
let filteredProductscount = products.length


apiFilters.pagination(resPerPage);  
products = await apiFilters.query.clone();

    res.status(200).json({
        filteredProductscount,
        resPerPage,
        products,
    });
});

// here we create new products  => /api/vi/admin/products
export const newProducts = catchAysncErrors( async (req, res) => {

req.body.user =  req.user._id

   const product = await Product.create(req.body)
   res.status(200).json({
    product,
   });
});

// here we add get single product function =>/api/v1/products/:id
export const getProductDetails =  catchAysncErrors(async (req, res,next) => {
    const product = await Product.findById(req?.params?.id);
if(!product)
{
    return next(new errorHandler('product not found',404));    // next is a inbuilt middleware that is pereesented inn express it gives next middleware from the stack
}
    res.status(200).json({
     product,
    });
 });

 // iam here to update our product details with the same path  =>/api/v1/products/:id

 export const updateProductDetails = catchAysncErrors (async (req, res) => {
 let product = await Product.findById(req?.params?.id);
if(!product)
{
    console.log("Product not found");
    return res.status(404).json({
        error:"Product not found",
    });
}

product = await Product.findByIdAndUpdate(req?.params?.id, req.body, {new:true})  // new:true means it returns doc of products
    res.status(200).json({
     product,
    });
 });


 export const deleteProductDetails = catchAysncErrors( async (req, res) => {
    const product = await Product.findById(req?.params?.id);
   if(!product)      // find product by id and if no means error shown
   {
       console.log("Product not found");
       return res.status(404).json({ 
           error:"Product not found",
       });
   }
   await product.deleteOne(); // here we detele the product 
       res.status(200).json({
        message: "Product deleted successfully", // pass the message if the product deleted .
       });
    });

//api/v1/reviews

    export const createProductreview = catchAysncErrors( async (req, res,next) => {

const{rating, comment, productId} = req.body

const review ={
    user:req?.user?._id,
    rating:Number(rating),
    comment,
};

        const product = await Product.findById(productId);
       if(!product)      // find product by id and if no means error shown
       {
           console.log("Product not found");
           return res.status(404).json({ 
               error:"Product not found",
           });
       }
       
const isReviewed = product?.reviews?.find((r)=> r.user.toString()=== req?.user?._id.toString());


if(isReviewed) {
    product.reviews.forEach((review)=>{
        if(review?.user?.toString() === req?.user?._id.toString())
        {
            review.comment = comment;
            review.rating = rating;

        }
    });
} else
{
    product.reviews.push(review);
    product.numofReviews = product.reviews.length;
}

product.ratings = product.reviews.reduce((acc, item)=>item.rating + acc ,0)/product.reviews.length;

await product.save({validateBeforSave:false});
      // here we detele the product 
           res.status(200).json({
            sucess:true,
           });
        });

        //api/v1/reviews

    export const getProductReviews = catchAysncErrors(async(req,res,next)=>
    {
        const product = await Product.findById(req.query.id);
        if(!product)
        {
            return next(new ErrorHandler("product not found",400));
        }
        res.status(200).json({
            reviews:product.reviews,
        });
    });


    export const deleteReview = catchAysncErrors( async (req, res,next) => {

        
                let product = await Product.findById(req.query.productId);
               if(!product)      // find product by id and if no means error shown
               {
                   return next(new ErrorHandler("Product not found",400));
               }
               
       const reviews= product?.reviews?.filter((review)=> review._id.toString()!== req?.query?._id.toString());
        
        const numOfReviews = reviews.length;
        
        const ratings = 
        numOfReviews === 0 ? 0
       : product.reviews.reduce((acc, item)=>item.rating + acc ,0)/numOfReviews;

        product = await Product.findByIdAndUpdate(req.query.productId,{reviews,numOfReviews,ratings},{new: true});
               
        await product.save({validateBeforeSave:false});
                   res.status(200).json({
                    product,
                   });
                });
        