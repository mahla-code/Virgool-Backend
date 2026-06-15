export enum BadRequestMessage{
    InvalidLoginData="اطلاعات ارسال شده برای ورود صحیح نمی باشد",
    InvalidregisterData="اطلاعات ارسال شده برای ثبت نام صحیح نمی باشد",
    ExpiresCode="کد منقضی شده است",
    TryAgain="مجددا تلاش کنید",
    SomeThingWentwrong="خطا رخ داده است",
    InvalidCategories="دسته بندی به درستی وارد نشده است",
    AlreadyAccepted="نظر انتخاب شده قبلا تایید شده است",
    AlreadyRejected="نظر انتخاب شده قبلا رد شده است",
    
}
export enum conflictMessage{
    ExistTitle="عنوان قبلا ثبت شده است",
    ExistEmail="ایمیل توسط شخص دیگری استفاده شده است",
    ExistPhone="شماره تلفن توسط شخص دیگری استفاده شده است",
    ExistUsername="نام کاربری توسط شخص دیگری استفاده شده است",
}
export enum NotFoundMessage{
    NotFoundCategory="دسته بندی یافت  نشد",
    NotFoundCode=" کد یافت نشد",
    NotFoundBlog=" مقاله یافت نشد",
    NotFoundComment=" نظر یافت نشد",
    NotFoundImage=" تصویر یافت نشد",
    NotFoundUser=" کاربر یافت نشد",
}
export enum ValidMessage{
    InvalidFormat=" فرمت تصویر صحیح نیست",
    InvalidEmailFormat=" فرمت ایمیل صحیح نیست",
    InvalidPhoneFormat=" فرمت  شماره نلفن صحیح نیست",
}
export enum AuthMessage{
    NotFoundAccount="حساب کاربری یافت نشد ",
    AlreadyExist="حساب کاربری با این مشخصات وجود دارد",
    ExpiresCode="کد منقضی شده است",
    TryAgain="دوباره تلاش کنید", 
    LoginAgain="مجددا وارد حساب خود شوید" ,
    LoginIsRequired=" وارد حساب خود شوید",
    BlockedUser=" حساب کاربری شما مسدود می باشد" 
}
export enum PublicMessage{
    SendOtp="کد یکبار مصرف ارسال شد",
    Loggedin="با موفقیت وارد حساب خود شدید",
    created="با موفقیت ایجاد شد",
    updated="با موفقیت یه روز رسانی شد",
    deleted="با موفقیت حذف شد",
    Liked="مقاله پسند شد",
    Disliked="پسند مقاله حذف شد",
    BookMarkrd="مقاله با موفقیت ذخیره شد",
    UnBookMarked="مقاله از لیست مقالات ذخیره شده حذف شد",
    CreatedComment="نظر شما با موقفیت ثبت شد",
    Followed="با موفقیت دنبال شد",
    UnFollowed="از لیست دنبال شده ها حذف شد",
    Blocked="کاربر با موفقیت مسدود شد",
    UnBlocked="کاربر از حالت مسدود خارج شد"
}